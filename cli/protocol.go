package main

// EngineMessage represents a JSON message from the Python engine to the CLI.
type EngineMessage struct {
	Type      string   `json:"type"`
	Timestamp string   `json:"timestamp"`
	// conversation_start
	Topic  string   `json:"topic,omitempty"`
	Goal   string   `json:"goal,omitempty"`
	Agents []string `json:"agents,omitempty"`
	// agent_message
	Agent   string `json:"agent,omitempty"`
	Content string `json:"content,omitempty"`
	Thought string `json:"thought,omitempty"`
	Round   int    `json:"round,omitempty"`
	// agent_question
	Question string `json:"question,omitempty"`
	// progress_saved
	Path string `json:"path,omitempty"`
	// conversation_end
	Reason string `json:"reason,omitempty"`
	Rounds int    `json:"rounds,omitempty"`
	// error
	Message string `json:"message,omitempty"`
}

// CLIMessage represents a JSON message from the CLI to the Python engine.
type CLIMessage struct {
	Type    string `json:"type"`
	Topic   string `json:"topic,omitempty"`
	Goal    string `json:"goal,omitempty"`
	Content string `json:"content,omitempty"`
}
