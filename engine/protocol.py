import json
import sys
from datetime import datetime, timezone


def emit(msg_type: str, **kwargs) -> None:
    """Write a JSON message to stdout (one object per line)."""
    msg = {"type": msg_type, "timestamp": datetime.now(timezone.utc).isoformat(), **kwargs}
    sys.stdout.write(json.dumps(msg) + "\n")
    sys.stdout.flush()


async def read_message(reader) -> dict | None:
    """Read one JSON message from the async stdin reader.

    Returns None on EOF.
    """
    line = await reader.readline()
    if not line:
        return None
    try:
        return json.loads(line.decode().strip())
    except json.JSONDecodeError:
        return None
