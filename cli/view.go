package main

import (
	"fmt"
	"image/color"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
)

// View renders the current UI state.
func (m model) View() tea.View {
	var content string
	switch m.phase {
	case phaseWelcome:
		content = m.viewWelcome()
	case phaseTopicInput:
		content = m.viewTopicInput()
	case phaseGoalInput:
		content = m.viewGoalInput()
	case phaseRunning, phasePaused:
		content = m.viewConversation()
	case phaseQuestion:
		content = m.viewQuestion()
	case phaseEnded:
		content = m.viewEnded()
	default:
		content = "Unknown state"
	}

	v := tea.NewView(content)
	v.AltScreen = true
	v.WindowTitle = "Parlor"
	return v
}

func (m model) viewWelcome() string {
	w := m.width
	if w <= 0 {
		w = 80
	}

	var b strings.Builder
	b.WriteString("\n")
	b.WriteString(titleStyle.Width(min(w, 60)).Render("  P A R L O R  "))
	b.WriteString("\n\n")
	b.WriteString(subtitleStyle.Render("  Multi-Agent Conversation Framework"))
	b.WriteString("\n\n")

	b.WriteString("  Agents:\n")
	for _, a := range m.config.Agents {
		nameStr := agentNameStyle(agentColor(a.Color)).Render(a.Name)
		b.WriteString(fmt.Sprintf("  • %s — %s\n", nameStr, truncate(a.Personality, w-20)))
	}

	b.WriteString("\n")
	b.WriteString(fmt.Sprintf("  Model: %s  |  Max rounds: %d\n", m.config.Model, m.config.MaxRounds))
	b.WriteString("\n")
	b.WriteString(helpStyle.Render("  Press Enter to start, q to quit"))
	b.WriteString("\n")

	return b.String()
}

func (m model) viewTopicInput() string {
	w := m.width
	if w <= 0 {
		w = 80
	}

	var b strings.Builder
	b.WriteString("\n")
	b.WriteString(titleStyle.Width(min(w, 60)).Render("  New Conversation"))
	b.WriteString("\n\n")
	b.WriteString("  Enter a topic for the agents to discuss:\n\n")
	prompt := inputPromptStyle.Render("  > ")
	b.WriteString(prompt)
	b.WriteString(m.topicInput)
	b.WriteString("▎")
	b.WriteString("\n\n")
	b.WriteString(helpStyle.Render("  Enter to confirm, Ctrl+C to quit"))
	b.WriteString("\n")

	return b.String()
}

func (m model) viewGoalInput() string {
	w := m.width
	if w <= 0 {
		w = 80
	}

	var b strings.Builder
	b.WriteString("\n")
	b.WriteString(titleStyle.Width(min(w, 60)).Render("  Conversation Goal"))
	b.WriteString("\n\n")
	b.WriteString(fmt.Sprintf("  Topic: %s\n\n", m.topic))
	b.WriteString("  Enter a goal (or press Enter to skip):\n\n")
	prompt := inputPromptStyle.Render("  > ")
	b.WriteString(prompt)
	b.WriteString(m.goalInput)
	b.WriteString("▎")
	b.WriteString("\n\n")
	b.WriteString(helpStyle.Render("  Enter to confirm, Ctrl+C to quit"))
	b.WriteString("\n")

	return b.String()
}

func (m model) viewConversation() string {
	w := m.width
	if w <= 0 {
		w = 80
	}
	h := m.height
	if h <= 0 {
		h = 24
	}

	header := m.renderHeader(w)
	footer := m.renderFooter(w)
	helpLine := m.renderHelp()

	// Available height for messages
	headerLines := strings.Count(header, "\n") + 1
	footerLines := strings.Count(footer, "\n") + strings.Count(helpLine, "\n") + 3
	msgHeight := h - headerLines - footerLines
	if msgHeight < 3 {
		msgHeight = 3
	}

	msgs := m.renderMessages(w - 4, msgHeight)

	var b strings.Builder
	b.WriteString(header)
	b.WriteString("\n")
	b.WriteString(msgs)
	b.WriteString("\n")
	b.WriteString(helpLine)
	b.WriteString("\n")
	if footer != "" {
		b.WriteString(footer)
		b.WriteString("\n")
	}

	return b.String()
}

func (m model) viewQuestion() string {
	w := m.width
	if w <= 0 {
		w = 80
	}

	header := m.renderHeader(w)

	var b strings.Builder
	b.WriteString(header)
	b.WriteString("\n\n")

	// Render the question prominently
	qLabel := "Question"
	if m.questionAgent != "" {
		agentClr, ok := m.agentColors[m.questionAgent]
		if !ok {
			agentClr = color.RGBA{R: 255, G: 215, B: 0, A: 255}
		}
		qLabel = agentNameStyle(agentClr).Render(m.questionAgent) + " asks"
	}
	b.WriteString(questionStyle.Render(fmt.Sprintf("%s: %s", qLabel, m.pendingQuestion)))
	b.WriteString("\n\n")

	// Show recent messages below the question
	msgs := m.renderMessages(w-4, min(m.height-12, 8))
	b.WriteString(msgs)
	b.WriteString("\n")

	prompt := inputPromptStyle.Render("  Answer > ")
	b.WriteString(prompt)
	b.WriteString(m.answerInput)
	b.WriteString("▎")
	b.WriteString("\n")

	return b.String()
}

func (m model) viewEnded() string {
	w := m.width
	if w <= 0 {
		w = 80
	}

	var b strings.Builder
	b.WriteString("\n")
	b.WriteString(endedStyle.Render("  Conversation ended."))
	b.WriteString("\n\n")

	if m.totalRounds > 0 {
		b.WriteString(fmt.Sprintf("  Total rounds: %d\n", m.totalRounds))
	}
	if m.topic != "" {
		b.WriteString(fmt.Sprintf("  Topic: %s\n", m.topic))
	}
	b.WriteString(fmt.Sprintf("  Messages: %d\n", len(m.messages)))

	if m.lastError != "" {
		b.WriteString("\n")
		b.WriteString(errorStyle.Render(fmt.Sprintf("  Error: %s", m.lastError)))
		b.WriteString("\n")
	}

	b.WriteString("\n")
	b.WriteString(helpStyle.Render("  [n] New conversation  [q] Quit"))
	b.WriteString("\n")

	// Show the conversation messages if we have space
	msgs := m.renderMessages(w-4, min(m.height-14, m.height-14))
	b.WriteString("\n")
	b.WriteString(msgs)
	b.WriteString("\n")

	return b.String()
}

// renderHeader builds the top bar showing round, topic, and status.
func (m model) renderHeader(w int) string {
	roundText := fmt.Sprintf("Round %d/%d", m.currentRound, m.maxRounds)
	if m.currentRound == 0 {
		roundText = fmt.Sprintf("Round -/%d", m.maxRounds)
	}

	statusText := ""
	switch m.phase {
	case phaseRunning:
		statusText = "Running"
	case phasePaused:
		statusText = "PAUSED"
	}

	topicText := m.topic
	if len(topicText) > w-30 {
		topicText = topicText[:w-33] + "..."
	}

	left := roundStyle.Render(roundText)
	right := roundStyle.Render(topicText)
	if statusText != "" {
		st := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("FFD700")).Render(statusText)
		right = st + "  " + right
	}

	return headerBorder.Width(w - 4).Render(
		lipgloss.JoinHorizontal(lipgloss.Center, left, "  ", right),
	)
}

// renderHelp shows the key bindings for the current phase.
func (m model) renderHelp() string {
	switch m.phase {
	case phaseRunning:
		if m.inputActive {
			return helpStyle.Render("  [Enter] Send  [Esc] Cancel")
		}
		return helpStyle.Render("  [p] Pause  [i] Interject  [t] Toggle thoughts  [↑↓] Scroll  [q] Quit")
	case phasePaused:
		if m.inputActive {
			return helpStyle.Render("  [Enter] Send  [Esc] Cancel")
		}
		return helpStyle.Render("  [r] Resume  [i] Interject  [↑↓] Scroll  [q] Quit")
	}
	return ""
}

// renderFooter shows the input bar when active.
func (m model) renderFooter(w int) string {
	if !m.inputActive {
		return ""
	}
	prompt := inputPromptStyle.Render("  > ")
	input := m.interjectInput
	bar := prompt + input + "▎"
	return bar
}

// renderMessages renders all conversation messages within the given dimensions.
func (m model) renderMessages(maxWidth, maxHeight int) string {
	if len(m.messages) == 0 {
		return helpStyle.Render("  Waiting for messages...")
	}

	var lines []string
	for i := range m.messages {
		cm := &m.messages[i]
		rendered := m.renderMessage(cm, maxWidth)
		for _, line := range strings.Split(rendered, "\n") {
			lines = append(lines, line)
		}
	}

	// Thinking indicator
	if m.thinkingAgent != "" {
		frame := spinnerFrames[m.spinnerFrame%len(spinnerFrames)]
		agentClr, ok := m.agentColors[m.thinkingAgent]
		if !ok {
			agentClr = color.RGBA{R: 200, G: 200, B: 200, A: 255}
		}
		nameStr := agentNameStyle(agentClr).Render(m.thinkingAgent)
		spinnerText := fmt.Sprintf("  %s %s is thinking...", frame, nameStr)
		lines = append(lines, lipgloss.NewStyle().Foreground(lipgloss.Color("888888")).Render(spinnerText))
	}

	// Apply scroll offset
	totalLines := len(lines)
	if m.autoScroll {
		// Auto-scroll: show the last maxHeight lines
		if totalLines > maxHeight {
			m.scrollOffset = totalLines - maxHeight
		} else {
			m.scrollOffset = 0
		}
	}

	// Clamp scrollOffset
	if m.scrollOffset < 0 {
		m.scrollOffset = 0
	}
	if m.scrollOffset > totalLines {
		m.scrollOffset = totalLines
	}

	end := m.scrollOffset + maxHeight
	if end > totalLines {
		end = totalLines
	}

	visible := lines[m.scrollOffset:end]
	// Pad to fill height
	for len(visible) < maxHeight {
		visible = append(visible, "")
	}

	return strings.Join(visible, "\n")
}

// renderMessage renders a single conversation message.
func (m model) renderMessage(cm *ConversationMessage, maxWidth int) string {
	if cm.IsUser {
		return userStyle.Render(fmt.Sprintf("  [You] %s", cm.Content))
	}

	agentClr, ok := m.agentColors[cm.Agent]
	if !ok {
		agentClr = color.RGBA{R: 200, G: 200, B: 200, A: 255}
	}

	// Determine displayed content (with typing animation)
	content := cm.Content
	if cm.Typing && cm.VisibleChars < len(content) {
		content = content[:cm.VisibleChars]
	}

	// Wrap content
	wrappedContent := wordWrap(content, maxWidth-6)

	bracketStyle := agentBracketStyle(agentClr)
	nameStyle := agentNameStyle(agentClr)
	label := bracketStyle.Render("[") + nameStyle.Render(cm.Agent) + bracketStyle.Render("]")

	var b strings.Builder

	// Render each line of the content with proper indentation
	contentLines := strings.Split(wrappedContent, "\n")
	for i, line := range contentLines {
		if i == 0 {
			b.WriteString(fmt.Sprintf("%s %s\n", label, line))
		} else {
			// Indent to align with content
			indent := strings.Repeat(" ", lipgloss.Width(label)+1)
			b.WriteString(fmt.Sprintf("%s%s\n", indent, line))
		}
	}

	// Thought bubble (only if showThoughts and thought exists)
	if cm.Thought != "" && m.showThoughts {
		wrappedThought := wordWrap(cm.Thought, maxWidth-10)
		thoughtContent := thoughtStyle.Render("💭 " + wrappedThought)
		b.WriteString(thoughtContent)
		b.WriteString("\n")
	}

	return b.String()
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	if maxLen <= 3 {
		return s[:maxLen]
	}
	return s[:maxLen-3] + "..."
}
