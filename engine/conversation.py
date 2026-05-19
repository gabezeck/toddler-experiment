import os
import re
from datetime import datetime, timezone
from pathlib import Path

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.base import TaskResult
from autogen_agentchat.conditions import ExternalTermination, MaxMessageTermination
from autogen_agentchat.messages import TextMessage
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient

from .config import AgentConfig, ParlorConfig
from .protocol import emit

# Agents wrap questions for the human moderator in [QUESTION]...[/QUESTION].
QUESTION_PATTERN = re.compile(r"\[QUESTION\](.+?)\[/QUESTION\]", re.DOTALL)

# Agents wrap private reflections in [THOUGHT]...[/THOUGHT].
THOUGHT_PATTERN = re.compile(r"\[THOUGHT\](.+?)\[/THOUGHT\]", re.DOTALL)


class ConversationEngine:
    """Drives a multi-agent round-robin conversation and emits JSON IPC events."""

    def __init__(self, config: ParlorConfig, conversations_dir: str = "conversations"):
        self.config = config
        self.conversations_dir = Path(conversations_dir)
        self.conv_dir: Path | None = None

        self.external_termination = ExternalTermination()
        self.max_msg_termination = MaxMessageTermination(
            config.max_rounds * len(config.agents)
        )
        self.termination = self.external_termination | self.max_msg_termination

        self.team: RoundRobinGroupChat | None = None
        self.is_paused = False
        self._intentional_stop = False  # True when we set termination ourselves (pause/question).

        self.pending_question: str | None = None
        self.current_topic: str | None = None
        self.current_goal: str | None = None
        self.message_count = 0
        self.agents_map: dict[str, AgentConfig] = {}

    # ------------------------------------------------------------------
    # Model client
    # ------------------------------------------------------------------

    def _create_model_client(self, agent_config: AgentConfig) -> OpenAIChatCompletionClient:
        model = agent_config.model or self.config.model
        kwargs: dict = {"model": model}
        if self.config.base_url:
            kwargs["base_url"] = self.config.base_url
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key:
            kwargs["api_key"] = api_key
        elif self.config.base_url:
            # Local providers (LM Studio, Ollama) don't need a real key
            # but the OpenAI SDK requires a non-empty string.
            kwargs["api_key"] = "parlor-local"

        # AutoGen validates model names against known OpenAI models.
        # For any other model (local, OpenRouter, etc.), provide a safe
        # default capability set so the client can initialize.
        if self.config.base_url:
            kwargs.setdefault("model_info", {
                "vision": False,
                "function_calling": True,
                "json_output": True,
                "structured_output": False,
                "multiple_system_messages": True,
                "family": "unknown",
            })

        return OpenAIChatCompletionClient(**kwargs)

    # ------------------------------------------------------------------
    # System message
    # ------------------------------------------------------------------

    def _build_system_message(self, agent: AgentConfig) -> str:
        base = agent.personality
        base += (
            "\n\nYou may occasionally include a private thought by wrapping it in "
            "[THOUGHT]your inner reflection here[/THOUGHT]. This thought will not be "
            "shared with other agents. Use it to reason about your response."
            "\n\nIf you need clarification from the human moderator, wrap your question in "
            "[QUESTION]your question here[/QUESTION]. The conversation will pause and "
            "the moderator will respond."
        )
        return base

    # ------------------------------------------------------------------
    # Start a new conversation
    # ------------------------------------------------------------------

    async def start(self, topic: str, goal: str | None = None) -> None:
        self.current_topic = topic
        self.current_goal = goal
        self.message_count = 0
        self.is_paused = False
        self.pending_question = None
        self._intentional_stop = False

        # Fresh termination conditions for each conversation.
        self.external_termination = ExternalTermination()
        self.max_msg_termination = MaxMessageTermination(
            self.config.max_rounds * len(self.config.agents)
        )
        self.termination = self.external_termination | self.max_msg_termination

        # Create agents.
        agents = []
        for ac in self.config.agents:
            model_client = self._create_model_client(ac)
            agent = AssistantAgent(
                name=ac.name,
                model_client=model_client,
                system_message=self._build_system_message(ac),
            )
            agents.append(agent)
            self.agents_map[ac.name] = ac

        # Build the initial task prompt.
        task = topic
        if goal:
            task += f"\n\nGoal: {goal}"

        # Create team.
        self.team = RoundRobinGroupChat(agents, termination_condition=self.termination)

        # Conversation output directory.
        self.conv_dir = (
            self.conversations_dir
            / datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        )
        self.conv_dir.mkdir(parents=True, exist_ok=True)

        agent_names = [ac.name for ac in self.config.agents]
        emit("conversation_start", topic=topic, goal=goal, agents=agent_names)

        # Run the conversation stream.
        await self._run_stream(task)

    # ------------------------------------------------------------------
    # Stream runner (shared by start / resume / interject)
    # ------------------------------------------------------------------

    async def _run_stream(self, task: str | None = None) -> None:
        """Consume the team's run_stream and emit protocol messages."""
        assert self.team is not None
        assert self.conv_dir is not None

        try:
            async for message in self.team.run_stream(task=task):
                # TaskResult marks the end of the stream.
                if isinstance(message, TaskResult):
                    if self._intentional_stop:
                        # We set termination ourselves (pause / question).
                        # Do NOT write conclusion or emit conversation_end.
                        self._intentional_stop = False
                    else:
                        await self._write_conclusion(self.conv_dir, message)
                        emit("conversation_end", reason="completed", rounds=self.message_count)
                    return

                # We only care about agent TextMessages and speaker selection events.
                if not isinstance(message, TextMessage):
                    # Emit thinking indicator when we know who's about to speak.
                    if hasattr(message, 'source') and message.source not in ("user", None):
                        emit("agent_thinking", agent=message.source)
                    continue
                if message.source == "user":
                    continue

                self.message_count += 1
                content = message.content
                agent_name = message.source
                n_agents = len(self.config.agents)
                round_num = (self.message_count + n_agents - 1) // n_agents

                # Extract thoughts.
                thought: str | None = None
                thought_match = THOUGHT_PATTERN.search(content)
                if thought_match:
                    thought = thought_match.group(1).strip()
                    content = THOUGHT_PATTERN.sub("", content).strip()

                # Check for questions to the moderator.
                question_match = QUESTION_PATTERN.search(content)
                if question_match:
                    question = question_match.group(1).strip()
                    content = QUESTION_PATTERN.sub("", content).strip()
                    self.pending_question = question
                    emit(
                        "agent_question",
                        agent=agent_name,
                        question=question,
                        round=round_num,
                    )

                # Always emit the message (even if it contained a question — the
                # question text is stripped but the rest of the content remains).
                if content:
                    emit(
                        "agent_message",
                        agent=agent_name,
                        content=content,
                        thought=thought,
                        round=round_num,
                    )

                # If we detected a question, terminate the stream for this turn.
                if question_match:
                    self._intentional_stop = True
                    self.external_termination.set()
                    # Do NOT return — keep consuming until TaskResult arrives.

                # Write progress every 5 rounds.
                if round_num % 5 == 0:
                    await self._write_progress(self.conv_dir)

        except Exception as exc:
            emit("error", message=f"Stream error: {exc}")

    # ------------------------------------------------------------------
    # Pause / Resume
    # ------------------------------------------------------------------

    def pause(self) -> None:
        """Pause the running conversation by setting external termination.

        The stream consumer (_run_stream) will see the TaskResult, detect
        the intentional stop, and return cleanly without emitting
        conversation_end.
        """
        if self.team and not self._intentional_stop:
            self.is_paused = True
            self._intentional_stop = True
            self.external_termination.set()

    async def resume(self) -> None:
        """Resume a paused conversation by re-entering the stream.

        run_stream() will reset() the termination conditions automatically,
        so the previous ExternalTermination.set() is cleared.
        """
        if self.team and self.is_paused:
            self.is_paused = False
            self._intentional_stop = False
            await self._run_stream()

    # ------------------------------------------------------------------
    # Interject (inject a moderator message mid-conversation)
    # ------------------------------------------------------------------

    async def interject(self, text: str) -> None:
        """Inject a user message into the conversation and resume streaming."""
        if not self.team:
            emit("error", message="No active conversation")
            return

        self.is_paused = False
        self._intentional_stop = False
        await self._run_stream(task=text)

    # ------------------------------------------------------------------
    # Answer a pending question
    # ------------------------------------------------------------------

    async def answer_question(self, answer: str) -> None:
        """Provide the moderator's answer and resume."""
        self.pending_question = None
        await self.interject(f"Moderator's response: {answer}")

    # ------------------------------------------------------------------
    # Progress / conclusion writers
    # ------------------------------------------------------------------

    async def _write_progress(self, conv_dir: Path) -> None:
        path = conv_dir / "progress.md"
        n_agents = len(self.config.agents)
        round_num = self.message_count // n_agents
        content = "# Progress Report\n\n"
        content += f"**Topic**: {self.current_topic}\n"
        if self.current_goal:
            content += f"**Goal**: {self.current_goal}\n"
        content += f"**Messages exchanged**: {self.message_count}\n"
        content += f"**Round**: {round_num}\n\n"
        content += "*Conversation ongoing...*\n"
        path.write_text(content)
        emit("progress_saved", path=str(path), round=round_num)

    async def _write_conclusion(self, conv_dir: Path, result: TaskResult) -> None:
        path = conv_dir / "conclusion.md"
        content = "# Conversation Conclusion\n\n"
        content += f"**Topic**: {self.current_topic}\n"
        if self.current_goal:
            content += f"**Goal**: {self.current_goal}\n"
        content += f"**Total messages**: {self.message_count}\n"
        content += f"**Stop reason**: {result.stop_reason}\n\n"
        content += "## Message Log\n\n"
        for msg in result.messages:
            if isinstance(msg, TextMessage) and msg.source != "user":
                content += f"### {msg.source}\n{msg.content}\n\n"
        path.write_text(content)
