package main

// engineMsg wraps an EngineMessage for delivery through Bubbletea's Update loop.
type engineMsg struct {
	msg EngineMessage
}

// engineDoneMsg signals that the engine subprocess has exited.
type engineDoneMsg struct{}

// typingTickMsg is emitted on each animation frame for the typing effect.
type typingTickMsg struct{}

// spinnerTickMsg is emitted on each animation frame for the spinner.
type spinnerTickMsg struct{}
