package main

import (
	"image/color"
	"strings"
	"time"

	tea "charm.land/bubbletea/v2"
)

// ConversationMessage is a single rendered message in the conversation.
type ConversationMessage struct {
	Agent   string
	Content string
	Thought string
	Round   int
	IsUser  bool
	// Typing animation state
	Typing       bool
	VisibleChars int
}

type phase int

const (
	phaseWelcome phase = iota
	phaseTopicInput
	phaseGoalInput
	phaseRunning
	phasePaused
	phaseQuestion // waiting for user to answer agent question
	phaseEnded
)

type model struct {
	phase      phase
	engine     *Engine
	config     Config
	configPath string

	// Conversation state
	messages     []ConversationMessage
	currentRound int
	totalRounds  int
	maxRounds    int
	topic        string
	goal         string

	// UI state
	topicInput     string
	goalInput      string
	interjectInput string
	answerInput    string
	inputActive    bool // whether the interjection input bar is shown
	thinkingAgent  string
	showThoughts   bool
	width          int
	height         int

	// Typing animation
	typingActive bool // true while any message is mid-animation

	// Pending question from agent
	pendingQuestion string
	questionAgent   string

	// Scroll
	scrollOffset int
	autoScroll   bool

	// Agent colors (name → hex)
	agentColors map[string]color.Color

	// Spinner
	spinnerFrame int

	// Error display
	lastError string
}

func newModel(configPath string, cfg Config) model {
	agentColors := make(map[string]color.Color, len(cfg.Agents))
	for _, a := range cfg.Agents {
		agentColors[a.Name] = agentColor(a.Color)
	}

	return model{
		phase:       phaseWelcome,
		config:      cfg,
		configPath:  configPath,
		maxRounds:   cfg.MaxRounds,
		agentColors: agentColors,
		showThoughts: true,
		autoScroll:  true,
	}
}

// Init is the first function called by Bubbletea.
func (m model) Init() tea.Cmd {
	return nil
}

// waitForEngine blocks until the engine emits a message, then wraps it.
func waitForEngine(e *Engine) tea.Cmd {
	return func() tea.Msg {
		select {
		case msg, ok := <-e.Messages():
			if !ok {
				return engineDoneMsg{}
			}
			return engineMsg{msg: msg}
		case <-e.Done():
			return engineDoneMsg{}
		}
	}
}

// typingTick returns a command that fires a typingTickMsg after a delay
// calibrated to the configured typing speed.
func (m model) typingTick() tea.Cmd {
	interval := time.Second / time.Duration(m.config.TypingSpeed)
	return tea.Tick(interval, func(t time.Time) tea.Msg {
		return typingTickMsg{}
	})
}

// spinnerTick returns a 100ms tick for advancing the spinner animation.
func spinnerTick() tea.Cmd {
	return tea.Tick(100*time.Millisecond, func(t time.Time) tea.Msg {
		return spinnerTickMsg{}
	})
}

// wordWrap wraps text to the given width, preserving existing newlines.
func wordWrap(text string, width int) string {
	if width <= 0 {
		return text
	}
	var b strings.Builder
	lines := strings.Split(text, "\n")
	for i, line := range lines {
		if i > 0 {
			b.WriteByte('\n')
		}
		b.WriteString(wrapLine(line, width))
	}
	return b.String()
}

func wrapLine(line string, width int) string {
	if len(line) <= width {
		return line
	}
	var b strings.Builder
	for len(line) > width {
		// Find the last space within width
		breakAt := width
		spaceIdx := strings.LastIndex(line[:width], " ")
		if spaceIdx > 0 {
			breakAt = spaceIdx + 1
		}
		b.WriteString(line[:breakAt])
		b.WriteByte('\n')
		line = line[breakAt:]
	}
	b.WriteString(line)
	return b.String()
}
