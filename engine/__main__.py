import asyncio
import json
import os
import signal
import sys
from pathlib import Path

from .config import load_config
from .conversation import ConversationEngine
from .protocol import emit, read_message


def _load_env() -> None:
    """Load .env file from CWD or project root into os.environ."""
    for candidate in (Path(".env"), Path(__file__).resolve().parent.parent / ".env"):
        if candidate.exists():
            with open(candidate) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    key = key.strip()
                    value = value.strip()
                    if key and key not in os.environ:
                        os.environ[key] = value
            return


async def main() -> None:
    if len(sys.argv) < 2:
        emit("error", message="Usage: python -m engine <config.yaml>")
        sys.exit(1)

    config_path = sys.argv[1]
    _load_env()
    config = load_config(config_path)
    engine = ConversationEngine(config)

    # Set up async stdin reader.
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await asyncio.get_event_loop().connect_read_pipe(lambda: protocol, sys.stdin)

    # Handle SIGTERM gracefully.
    loop = asyncio.get_event_loop()
    loop.add_signal_handler(signal.SIGTERM, lambda: asyncio.ensure_future(_shutdown(engine)))

    stream_task: asyncio.Task | None = None

    def _on_task_done(task: asyncio.Task) -> None:
        """Report uncaught errors from background stream tasks."""
        if task.cancelled():
            return
        exc = task.exception()
        if exc is not None:
            emit("error", message=f"Conversation error: {exc}")


    try:
        while True:
            msg = await read_message(reader)
            if msg is None:
                # EOF — parent process closed stdin.
                break

            msg_type = msg.get("type")

            if msg_type == "start":
                if stream_task and not stream_task.done():
                    emit("error", message="Conversation already running")
                    continue
                topic = msg.get("topic", "")
                goal = msg.get("goal")
                stream_task = asyncio.create_task(engine.start(topic, goal))
                stream_task.add_done_callback(_on_task_done)

            elif msg_type == "pause":
                engine.pause()

            elif msg_type == "resume":
                if stream_task and not stream_task.done():
                    emit("error", message="Stream still running; cannot resume")
                    continue
                stream_task = asyncio.create_task(engine.resume())
                stream_task.add_done_callback(_on_task_done)

            elif msg_type == "interject":
                text = msg.get("content", "")
                if stream_task and not stream_task.done():
                    emit("error", message="Stream still running; cannot interject")
                    continue
                stream_task = asyncio.create_task(engine.interject(text))
                stream_task.add_done_callback(_on_task_done)

            elif msg_type == "answer":
                answer = msg.get("content", "")
                if stream_task and not stream_task.done():
                    emit("error", message="Stream still running; cannot answer")
                    continue
                stream_task = asyncio.create_task(engine.answer_question(answer))
                stream_task.add_done_callback(_on_task_done)

    except KeyboardInterrupt:
        pass

    # Clean up any running stream.
    if stream_task and not stream_task.done():
        stream_task.cancel()
        try:
            await stream_task
        except asyncio.CancelledError:
            pass


async def _shutdown(engine: ConversationEngine) -> None:
    engine.pause()
    emit("conversation_end", reason="terminated", rounds=engine.message_count)


if __name__ == "__main__":
    asyncio.run(main())
