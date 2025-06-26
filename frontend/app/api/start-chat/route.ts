import { type NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { type ChildProcess, spawn } from 'child_process';

let pythonProcess: ChildProcess | null = null;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agent1Name, agent1Prompt, agent2Name, agent2Prompt, initialMessage } = body;

  const config = {
    agent1Name,
    agent1Prompt,
    agent2Name,
    agent2Prompt,
    initialMessage,
  };

  await fs.writeFile('../config.json', JSON.stringify(config, null, 2));

  pythonProcess = spawn('python3', ['main.py'], { cwd: '..' });

  const stream = new ReadableStream({
    start(controller) {
      pythonProcess?.stdout?.on('data', (data) => {
        controller.enqueue(data);
      });
      pythonProcess?.stderr?.on('data', (data) => {
        console.error(`stderr: ${data}`);
        controller.enqueue(data);
      });
      pythonProcess?.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        controller.close();
        pythonProcess = null;
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'connection': 'keep-alive',
    },
  });
}