package main

import (
	"image/color"
	"strings"

	"charm.land/lipgloss/v2"
)

// agentColor parses a hex color string into a color.Color for lipgloss.
func agentColor(hex string) color.Color {
	h := strings.TrimPrefix(hex, "#")
	return lipgloss.Color(h)
}

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("F0F0F0")).
			Background(lipgloss.Color("1A1A2E")).
			Padding(0, 2)

	subtitleStyle = lipgloss.NewStyle().
			Italic(true).
			Foreground(lipgloss.Color("888888"))

	thoughtStyle = lipgloss.NewStyle().
			Italic(true).
			Foreground(lipgloss.Color("666666")).
			Background(lipgloss.Color("1E1E2E")).
			Padding(0, 1).
			MarginLeft(4)

	inputPromptStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("FFD700"))

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("555555"))

	questionStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("FFD700")).
			Background(lipgloss.Color("2D1B00")).
			Padding(0, 1).
			MarginLeft(2)

	roundStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("444444"))

	errorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("FF4444")).
			Bold(true)

	headerBorder = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder(), true).
			BorderForeground(lipgloss.Color("333355")).
			Padding(0, 1)

	endedStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("88DDAA")).
			Padding(1, 0)

	spinnerFrames = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
)

// agentNameStyle returns a bold, colored style for an agent's display name.
func agentNameStyle(c color.Color) lipgloss.Style {
	return lipgloss.NewStyle().
		Bold(true).
		Foreground(c)
}

// agentBracketStyle returns a colored bracket style around an agent name.
func agentBracketStyle(c color.Color) lipgloss.Style {
	return lipgloss.NewStyle().Foreground(c)
}

// userStyle is the style for user interjection messages.
var userStyle = lipgloss.NewStyle().
	Foreground(lipgloss.Color("AAAAAA")).
	Italic(true)
