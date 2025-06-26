import { NextResponse } from 'next/server';

let pythonProcess: import("child_process").ChildProcess | null = null;

export async function GET() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
  return new NextResponse(null, { status: 200 });
}
