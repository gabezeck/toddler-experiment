package main

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// AgentConfig holds the configuration for a single conversation agent.
type AgentConfig struct {
	Name        string `yaml:"name"`
	Personality string `yaml:"personality"`
	Color       string `yaml:"color"`
	Model       string `yaml:"model,omitempty"`
}

// Config holds the full YAML configuration for a conversation session.
type Config struct {
	Model       string        `yaml:"model"`
	MaxRounds   int           `yaml:"max_rounds"`
	Agents      []AgentConfig `yaml:"agents"`
	TypingSpeed int           `yaml:"typing_speed,omitempty"`
}

// loadConfig reads and validates a YAML config file.
func loadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return Config{}, fmt.Errorf("reading config: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("parsing config: %w", err)
	}

	if len(cfg.Agents) < 2 {
		return Config{}, fmt.Errorf("config must define at least 2 agents, got %d", len(cfg.Agents))
	}
	if len(cfg.Agents) > 4 {
		return Config{}, fmt.Errorf("config must define at most 4 agents, got %d", len(cfg.Agents))
	}
	for i, a := range cfg.Agents {
		if a.Name == "" {
			return Config{}, fmt.Errorf("agent %d: name is required", i)
		}
		if a.Color == "" {
			return Config{}, fmt.Errorf("agent %d: color is required", i)
		}
	}
	if cfg.MaxRounds <= 0 {
		cfg.MaxRounds = 10
	}
	if cfg.Model == "" {
		cfg.Model = "gpt-4o"
	}
	if cfg.TypingSpeed <= 0 {
		cfg.TypingSpeed = 30
	}

	return cfg, nil
}
