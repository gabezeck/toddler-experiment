# Parlor

Multi-agent conversation framework. Configure 2–4 AI agents with distinct personalities, give them a topic and goal, and watch them discuss in a beautiful terminal UI.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Round 3/20  │  RUNNING  What makes a good story ending?            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Maya] I think a great ending recontextualizes everything          │
│         that came before. Like the last piece of a puzzle.          │
│         💭 I should build on Jordan's point about ambiguity...      │
│                                                                     │
│  [Jordan] Yes! The best endings feel inevitable in retrospect       │
│           but surprising in the moment. It's about planting seeds.  │
│                                                                     │
│  ⠹ Sage is thinking...                                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [p] Pause  [i] Interject  [t] Toggle thoughts  [q] Quit            │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

- **2–4 agents** with configurable personalities via YAML
- **Round-robin discussion** powered by AutoGen 0.4
- **Beautiful TUI** built with Bubbletea v2 — colors, typing animations, spinner
- **Pause & resume** at any point
- **Interject** your own messages mid-conversation
- **Agent questions** — agents can pause the conversation to ask you something
- **Thought bubbles** — agents emit private reflections you can toggle on/off
- **Progress docs** — automatic markdown documentation in `conversations/`

## Quick Start

```bash
# 1. Set up Python environment
python3.13 -m venv .venv
source .venv/bin/activate
pip install autogen-agentchat "autogen-ext[openai]" pyyaml

# 2. Set your API key
cp .env.example .env
# Edit .env — add your OpenAI, OpenRouter, or local API key

# 3. Build the CLI
cd cli && go build -o parlor . && cd ..

# 4. Run
./cli/parlor --config config.yaml
```

## Configuration

Create a YAML file defining your agents:

```yaml
model: gpt-4o
max_rounds: 20
# base_url: https://openrouter.ai/api/v1   # OpenRouter
# base_url: http://localhost:1234/v1        # LM Studio
# base_url: http://localhost:11434/v1       # Ollama

agents:
  - name: Ada
    personality: >
      You are Ada, a pragmatic technologist who believes technology
      can solve most problems. You argue from data and scalability.
    color: "#3b82f6"

  - name: Marcus
    personality: >
      You are Marcus, a humanist philosopher who prioritizes human
      dignity and questions rapid technological change.
    color: "#ef4444"

  - name: Sage
    personality: >
      You are Sage, a synthesizer who finds common ground and reframes debates.
    color: "#8b5cf6"
```

### Fields

| Field                  | Required | Description                                                          |
| ---------------------- | -------- | -------------------------------------------------------------------- |
| `model`                | Yes      | Model name (e.g. `gpt-4o`, `openai/gpt-4.1-nano`, `local-model`)    |
| `max_rounds`           | Yes      | Maximum conversation rounds before stopping                          |
| `base_url`             | No       | API base URL. Falls back to `OPENAI_BASE_URL` env var               |
| `agents`               | Yes      | List of 2–4 agent definitions                                        |
| `agents[].name`        | Yes      | Agent display name                                                   |
| `agents[].personality` | Yes      | System prompt defining the agent's personality                       |
| `agents[].color`       | Yes      | Hex color for the agent's name in the UI                             |
| `agents[].model`       | No       | Override the global model for this agent                             |


### Providers

Parlor works with any OpenAI-compatible API. Set `base_url` in your YAML or `OPENAI_BASE_URL` in `.env`.

| Provider | `base_url` | `model` example | Notes |
| -------- | ---------- | --------------- | ----- |
| **OpenAI** | _(default)_ | `gpt-4o` | No base_url needed |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `openai/gpt-4.1-nano` | [Set `OPENAI_API_KEY` to your OR key](https://openrouter.ai/keys) |
| **LM Studio** | `http://localhost:1234/v1` | _your loaded model_ | API key can be any non-empty string |
| **Ollama** | `http://localhost:11434/v1` | `llama3` | API key can be any non-empty string |
### Example configs

- `config.yaml` — Maya & Jordan creative partners (default, OpenAI)
- `cli/examples/debate.yaml` — 3-agent debate (technologist vs humanist vs synthesizer)
- `cli/examples/brainstorm.yaml` — 4-agent brainstorm session
- `cli/examples/toddlers.yaml` — Original toddler experiment (2 curious 4-year-olds)
- `cli/examples/openrouter.yaml` — 2-agent via OpenRouter (free Llama 4 Scout)
- `cli/examples/local.yaml` — 2-agent via LM Studio / Ollama (local inference)

## Key Bindings

| Key       | Action                  |
| --------- | ----------------------- |
| `Enter`   | Confirm input / advance |
| `p`       | Pause conversation      |
| `r`       | Resume conversation     |
| `i`       | Open interjection input |
| `t`       | Toggle thought bubbles  |
| `↑` / `↓` | Scroll messages         |
| `q`       | Quit                    |
| `Ctrl+C`  | Force quit              |

## Architecture

```
┌──────────────┐    JSON over stdin/stdout    ┌──────────────┐
│   Go CLI     │◄────────────────────────────►│   Python     │
│   Bubbletea  │                              │   Engine     │
│              │  {"type":"agent_message",..} │   AutoGen    │
│   Renders UI │◄─── streaming messages ──────│   0.4 API    │
│   Handles    │───▶ {"type":"interject",...} │              │
│   input      │───▶ {"type":"pause"}         │              │
└──────────────┘                              └──────────────┘
```

- **Go CLI** (`cli/`): Bubbletea v2 TUI with typing animations, spinner, scroll
- **Python Engine** (`engine/`): Async AutoGen 0.4 `RoundRobinGroupChat` with JSON IPC
- Communication: newline-delimited JSON over subprocess stdin/stdout

## Conversation Output

Each conversation creates a directory under `conversations/` with:

- `progress.md` — auto-updated every 5 rounds
- `conclusion.md` — full message log written when the conversation ends

## Special Agent Syntax

Agents can use special tokens in their responses:

- `[THOUGHT]inner reflection[/THOUGHT]` — private thought shown as a toggleable bubble
- `[QUESTION]question for moderator[/QUESTION]` — pauses conversation and prompts user

## Requirements

- **Go** 1.24+ (for CLI)
- **Python** 3.10+ (for engine)
- **OpenAI API key** with access to your configured model

## License

MIT
