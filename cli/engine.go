package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
)

// Engine manages the Python engine subprocess and its IPC channels.
type Engine struct {
	cmd   *exec.Cmd
	stdin io.WriteCloser
	msgs  chan EngineMessage
	done  chan struct{}
	mu    sync.Mutex
}

// NewEngine starts the Python engine subprocess and begins reading its stdout.
// projectRoot is the directory containing the engine/ package.
func NewEngine(configPath string, projectRoot string) (*Engine, error) {
	cmd := exec.Command(filepath.Join(projectRoot, ".venv", "bin", "python"), "-m", "engine", configPath)
	cmd.Dir = projectRoot
	cmd.Stderr = os.Stderr

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("engine stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("engine stdout pipe: %w", err)
	}

	e := &Engine{
		cmd:  cmd,
		stdin: stdin,
		msgs: make(chan EngineMessage, 256),
		done: make(chan struct{}),
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("starting engine: %w", err)
	}

	go e.readOutput(stdout)

	return e, nil
}

func (e *Engine) readOutput(r io.Reader) {
	defer close(e.done)
	scanner := bufio.NewScanner(r)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		var msg EngineMessage
		if err := json.Unmarshal(scanner.Bytes(), &msg); err != nil {
			log.Printf("engine: invalid JSON: %v", err)
			continue
		}
		e.msgs <- msg
	}
	if err := scanner.Err(); err != nil {
		log.Printf("engine: read error: %v", err)
	}
}

// Send writes a CLI message to the engine's stdin as newline-delimited JSON.
func (e *Engine) Send(msg CLIMessage) error {
	e.mu.Lock()
	defer e.mu.Unlock()
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}
	data = append(data, '\n')
	_, err = e.stdin.Write(data)
	return err
}

// Messages returns the channel of incoming engine messages.
func (e *Engine) Messages() <-chan EngineMessage { return e.msgs }

// Done returns a channel that is closed when the engine exits.
func (e *Engine) Done() <-chan struct{} { return e.done }

// Close shuts down the engine subprocess.
func (e *Engine) Close() {
	e.stdin.Close()
	if e.cmd.Process != nil {
		e.cmd.Process.Kill()
	}
	e.cmd.Wait()
}

// findProjectRoot walks up from the executable location to find the directory
// containing engine/.
func findProjectRoot() string {
	// Walk up from CWD to find engine/
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}
	for i := 0; i < 10; i++ {
		if _, err := os.Stat(filepath.Join(dir, "engine")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "."
}
