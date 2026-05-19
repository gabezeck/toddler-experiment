package main

import (
	"strings"

	tea "charm.land/bubbletea/v2"
)

// Update handles all incoming messages and state transitions.
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyPressMsg:
		return m.handleKey(msg)

	case engineMsg:
		return m.handleEngineMsg(msg.msg)

	case engineDoneMsg:
		if m.phase != phaseEnded {
			m.lastError = "Engine process exited unexpectedly"
			m.phase = phaseEnded
		}
		return m, nil

	case typingTickMsg:
		return m.handleTypingTick()

	case spinnerTickMsg:
		if m.thinkingAgent != "" {
			m.spinnerFrame = (m.spinnerFrame + 1) % len(spinnerFrames)
			return m, spinnerTick()
		}
		return m, nil
	}

	return m, nil
}

// handleKey dispatches key events based on the current phase.
func (m model) handleKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c", "ctrl+q":
		return m, tea.Quit
	}

	switch m.phase {
	case phaseWelcome:
		return m.handleWelcomeKey(msg)
	case phaseTopicInput:
		return m.handleTopicInputKey(msg)
	case phaseGoalInput:
		return m.handleGoalInputKey(msg)
	case phaseRunning:
		return m.handleRunningKey(msg)
	case phasePaused:
		return m.handlePausedKey(msg)
	case phaseQuestion:
		return m.handleQuestionKey(msg)
	case phaseEnded:
		return m.handleEndedKey(msg)
	}
	return m, nil
}

func (m model) handleWelcomeKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		m.phase = phaseTopicInput
		return m, nil
	case "q":
		return m, tea.Quit
	}
	return m, nil
}

func (m model) handleTopicInputKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		if strings.TrimSpace(m.topicInput) == "" {
			return m, nil
		}
		m.topic = m.topicInput
		m.phase = phaseGoalInput
		return m, nil
	case "backspace":
		if len(m.topicInput) > 0 {
			m.topicInput = m.topicInput[:len(m.topicInput)-1]
		}
		return m, nil
	default:
		if len(msg.Text) > 0 {
			m.topicInput += msg.Text
		}
		return m, nil
	}
}

func (m model) handleGoalInputKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		m.goal = m.goalInput
		return m.startConversation()
	case "backspace":
		if len(m.goalInput) > 0 {
			m.goalInput = m.goalInput[:len(m.goalInput)-1]
		}
		return m, nil
	default:
		if len(msg.Text) > 0 {
			m.goalInput += msg.Text
		}
		return m, nil
	}
}

func (m model) handleRunningKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	// If the interjection input is active, route keys there
	if m.inputActive {
		switch msg.String() {
		case "enter":
			text := strings.TrimSpace(m.interjectInput)
			if text == "" {
				m.inputActive = false
				return m, nil
			}
			if m.engine != nil {
				m.engine.Send(CLIMessage{
					Type:    "interject",
					Content: text,
				})
			}
			m.messages = append(m.messages, ConversationMessage{
				Agent:   "You",
				Content: text,
				IsUser:  true,
			})
			m.interjectInput = ""
			m.inputActive = false
			m.autoScroll = true
			return m, nil
		case "esc":
			m.inputActive = false
			m.interjectInput = ""
			return m, nil
		case "backspace":
			if len(m.interjectInput) > 0 {
				m.interjectInput = m.interjectInput[:len(m.interjectInput)-1]
			}
			return m, nil
		default:
			if len(msg.Text) > 0 {
				m.interjectInput += msg.Text
			}
			return m, nil
		}
	}

	// Normal running controls
	switch msg.String() {
	case "p":
		m.phase = phasePaused
		if m.engine != nil {
			m.engine.Send(CLIMessage{Type: "pause"})
		}
		return m, nil
	case "i":
		m.inputActive = true
		m.interjectInput = ""
		return m, nil
	case "t":
		m.showThoughts = !m.showThoughts
		return m, nil
	case "q":
		return m, tea.Quit
	case "up":
		m.scrollOffset = max(m.scrollOffset-3, 0)
		m.autoScroll = false
		return m, nil
	case "down":
		m.scrollOffset += 3
		m.autoScroll = true
		return m, nil
	}
	return m, nil
}

func (m model) handlePausedKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	if m.inputActive {
		switch msg.String() {
		case "enter":
			text := strings.TrimSpace(m.interjectInput)
			if text == "" {
				m.inputActive = false
				return m, nil
			}
			if m.engine != nil {
				m.engine.Send(CLIMessage{
					Type:    "interject",
					Content: text,
				})
			}
			m.messages = append(m.messages, ConversationMessage{
				Agent:   "You",
				Content: text,
				IsUser:  true,
			})
			m.interjectInput = ""
			m.inputActive = false
			m.autoScroll = true
			return m, nil
		case "esc":
			m.inputActive = false
			m.interjectInput = ""
			return m, nil
		case "backspace":
			if len(m.interjectInput) > 0 {
				m.interjectInput = m.interjectInput[:len(m.interjectInput)-1]
			}
			return m, nil
		default:
			if len(msg.Text) > 0 {
				m.interjectInput += msg.Text
			}
			return m, nil
		}
	}

	switch msg.String() {
	case "r":
		m.phase = phaseRunning
		if m.engine != nil {
			m.engine.Send(CLIMessage{Type: "resume"})
		}
		return m, nil
	case "i":
		m.inputActive = true
		m.interjectInput = ""
		return m, nil
	case "q":
		return m, tea.Quit
	case "up":
		m.scrollOffset = max(m.scrollOffset-3, 0)
		m.autoScroll = false
		return m, nil
	case "down":
		m.scrollOffset += 3
		m.autoScroll = true
		return m, nil
	}
	return m, nil
}

func (m model) handleQuestionKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "enter":
		text := strings.TrimSpace(m.answerInput)
		if text == "" {
			return m, nil
		}
		if m.engine != nil {
			m.engine.Send(CLIMessage{
				Type:    "answer",
				Content: text,
			})
		}
		m.messages = append(m.messages, ConversationMessage{
			Agent:   "You",
			Content: text,
			IsUser:  true,
		})
		m.answerInput = ""
		m.pendingQuestion = ""
		m.questionAgent = ""
		m.phase = phaseRunning
		m.autoScroll = true
		return m, nil
	case "backspace":
		if len(m.answerInput) > 0 {
			m.answerInput = m.answerInput[:len(m.answerInput)-1]
		}
		return m, nil
	default:
		if len(msg.Text) > 0 {
			m.answerInput += msg.Text
		}
		return m, nil
	}
}

func (m model) handleEndedKey(msg tea.KeyPressMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "q":
		return m, tea.Quit
	case "n":
		// Reset for a new conversation
		if m.engine != nil {
			m.engine.Close()
		}
		m.engine = nil
		m.messages = nil
		m.topic = ""
		m.goal = ""
		m.topicInput = ""
		m.goalInput = ""
		m.interjectInput = ""
		m.answerInput = ""
		m.inputActive = false
		m.thinkingAgent = ""
		m.typingActive = false
		m.currentRound = 0
		m.totalRounds = 0
		m.scrollOffset = 0
		m.autoScroll = true
		m.pendingQuestion = ""
		m.questionAgent = ""
		m.lastError = ""
		m.phase = phaseTopicInput
		return m, nil
	}
	return m, nil
}

// handleEngineMsg processes messages from the Python engine.
func (m model) handleEngineMsg(msg EngineMessage) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg.Type {
	case "conversation_start":
		if msg.Topic != "" {
			m.topic = msg.Topic
		}

	case "agent_thinking":
		m.thinkingAgent = msg.Agent
		cmd = spinnerTick()

	case "agent_message":
		m.thinkingAgent = ""
		messages := &m.messages

		// Finalize any in-progress typing
		for i := len(*messages) - 1; i >= 0; i-- {
			if (*messages)[i].Typing {
				(*messages)[i].Typing = false
				(*messages)[i].VisibleChars = len((*messages)[i].Content)
			}
		}

		cm := ConversationMessage{
			Agent:   msg.Agent,
			Content: msg.Content,
			Thought: msg.Thought,
			Round:   msg.Round,
			Typing:  true,
		}
		cm.VisibleChars = 0
		*messages = append(*messages, cm)
		m.typingActive = true
		m.autoScroll = true

		if msg.Round > m.currentRound {
			m.currentRound = msg.Round
		}

		cmd = m.typingTick()

	case "agent_question":
		m.pendingQuestion = msg.Question
		m.questionAgent = msg.Agent
		m.phase = phaseQuestion
		m.answerInput = ""

	case "progress_saved":
		// Informational, no state change needed

	case "conversation_end":
		m.phase = phaseEnded
		m.totalRounds = msg.Rounds
		m.thinkingAgent = ""
		m.typingActive = false
		// Finalize any remaining typing animations
		for i := range m.messages {
			m.messages[i].Typing = false
			m.messages[i].VisibleChars = len(m.messages[i].Content)
		}

	case "error":
		m.lastError = msg.Message
		if m.phase == phaseRunning || m.phase == phasePaused {
			m.phase = phaseEnded
		}
	}

	// Always continue listening for engine messages
	if m.engine != nil {
		cmd = tea.Batch(cmd, waitForEngine(m.engine))
	}

	return m, cmd
}

// handleTypingTick advances the typing animation for in-progress messages.
func (m model) handleTypingTick() (tea.Model, tea.Cmd) {
	anyTyping := false
	for i := range m.messages {
		cm := &m.messages[i]
		if !cm.Typing {
			continue
		}
		// Advance visible characters by a few per tick for speed
		cm.VisibleChars += 2
		if cm.VisibleChars >= len(cm.Content) {
			cm.VisibleChars = len(cm.Content)
			cm.Typing = false
		} else {
			anyTyping = true
		}
	}

	m.typingActive = anyTyping

	var cmd tea.Cmd
	if anyTyping {
		cmd = m.typingTick()
	}
	// Keep spinner going if an agent is thinking
	if m.thinkingAgent != "" {
		cmd = tea.Batch(cmd, spinnerTick())
	}
	return m, cmd
}

// startConversation launches the engine and sends the start message.
func (m model) startConversation() (tea.Model, tea.Cmd) {
	projectRoot := findProjectRoot()
	eng, err := NewEngine(m.configPath, projectRoot)
	if err != nil {
		m.lastError = "Failed to start engine: " + err.Error()
		m.phase = phaseEnded
		return m, nil
	}
	m.engine = eng
	m.phase = phaseRunning
	m.autoScroll = true

	startCmd := CLIMessage{
		Type:  "start",
		Topic: m.topic,
		Goal:  m.goal,
	}
	if err := m.engine.Send(startCmd); err != nil {
		m.lastError = "Failed to send start: " + err.Error()
		m.phase = phaseEnded
		m.engine.Close()
		m.engine = nil
		return m, nil
	}

	return m, waitForEngine(m.engine)
}
