import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass
class AgentConfig:
    name: str
    personality: str  # system message
    color: str  # hex color for UI
    model: str | None = None  # override global model


@dataclass
class ParlorConfig:
    model: str
    max_rounds: int
    agents: list[AgentConfig]
    base_url: str | None = None  # OpenAI-compatible API base URL
    typing_speed: int = 30  # chars per second for animation hint

def load_config(path: str | Path) -> ParlorConfig:
    """Load and validate a YAML config file."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Config file not found: {p}")

    with open(p) as f:
        raw = yaml.safe_load(f)

    if not isinstance(raw, dict):
        raise ValueError("Config file must be a YAML mapping")

    model = raw.get("model")
    if not model or not isinstance(model, str):
        raise ValueError("Config must contain a 'model' string (e.g. 'gpt-4o')")

    max_rounds = raw.get("max_rounds")
    if not isinstance(max_rounds, int) or max_rounds < 1:
        raise ValueError("Config must contain 'max_rounds' (positive integer)")

    raw_agents = raw.get("agents")
    if not isinstance(raw_agents, list) or len(raw_agents) < 2 or len(raw_agents) > 4:
        raise ValueError("Config must contain 'agents' list with 2-4 entries")

    agents: list[AgentConfig] = []
    for i, a in enumerate(raw_agents):
        if not isinstance(a, dict):
            raise ValueError(f"Agent entry {i} must be a mapping")
        name = a.get("name")
        personality = a.get("personality")
        color = a.get("color")
        if not name or not isinstance(name, str):
            raise ValueError(f"Agent entry {i} must have a 'name' string")
        if not personality or not isinstance(personality, str):
            raise ValueError(f"Agent entry {i} must have a 'personality' string")
        if not color or not isinstance(color, str):
            raise ValueError(f"Agent entry {i} must have a 'color' string (hex)")
        agents.append(AgentConfig(
            name=name,
            personality=personality,
            color=color,
            model=a.get("model"),
        ))

    base_url = raw.get("base_url") or os.environ.get("OPENAI_BASE_URL")

    return ParlorConfig(
        model=model,
        max_rounds=max_rounds,
        agents=agents,
        base_url=base_url,
        typing_speed=raw.get("typing_speed", 30),
    )
