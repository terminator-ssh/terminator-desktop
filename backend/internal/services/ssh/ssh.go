package ssh

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"terminator-desktop/backend/internal/apperror"
	"time"

	"github.com/creack/pty"
	"golang.org/x/crypto/ssh"
)

type SSHEmitter interface {
	EmitData(sessionID string, data []byte)
	EmitClosed(sessionID string)
}

type SSHConnectionConfig struct {
	ID             string `json:"id"`
	Host           string `json:"host"`
	Port           int    `json:"port"`
	Username       string `json:"username"`
	Password       string `json:"password,omitempty"`
	PrivateKey     string `json:"privateKey,omitempty"`
	PrivateKeyPath string `json:"privateKeyPath,omitempty"`
}

type activeSession struct {
	client  *ssh.Client
	session *ssh.Session
	stdin   io.WriteCloser
	pty     *os.File
	cmd     *exec.Cmd
}

type SshService struct {
	emitter  SSHEmitter
	mu       sync.RWMutex
	sessions map[string]*activeSession
}

// TODO: configurable timeout?
const timeout = 15 * time.Second

const batchRatePerSecond = 60

func NewSshService(emitter SSHEmitter) *SshService {
	return &SshService{
		emitter:  emitter,
		sessions: make(map[string]*activeSession),
	}
}

func (s *SshService) connectOpenSSH(config *SSHConnectionConfig) error {
	sshPath, err := exec.LookPath("ssh")
	if err != nil {
		return apperror.SSHConnectionFailed(
			"OpenSSH client not found. Hardware key connections require the system ssh command.",
			err,
		)
	}

	keyPath := expandPath(config.PrivateKeyPath)
	addr := fmt.Sprintf("%s@%s", config.Username, config.Host)
	args := []string{
		"-tt",
		"-o", "StrictHostKeyChecking=accept-new",
		"-o", "IdentitiesOnly=yes",
		"-i", keyPath,
		"-p", strconv.Itoa(config.Port),
		addr,
	}

	cmd := exec.Command(sshPath, args...)
	cmd.Env = os.Environ()

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{Rows: 24, Cols: 80})
	if err != nil {
		return apperror.SSHConnectionFailed(fmt.Sprintf("failed to start OpenSSH for %s:%d", config.Host, config.Port), err)
	}

	currentSession := &activeSession{
		stdin: ptmx,
		pty:   ptmx,
		cmd:   cmd,
	}

	s.mu.Lock()
	s.sessions[config.ID] = currentSession
	s.mu.Unlock()

	go s.streamOutput(config.ID, ptmx, currentSession)
	go func() {
		_ = cmd.Wait()
		_ = ptmx.Close()
	}()

	return nil
}

func expandPath(path string) string {
	if path == "~" {
		if home, err := os.UserHomeDir(); err == nil {
			return home
		}
	}
	if strings.HasPrefix(path, "~/") {
		if home, err := os.UserHomeDir(); err == nil {
			return filepath.Join(home, path[2:])
		}
	}
	return path
}

func (s *SshService) Connect(config *SSHConnectionConfig) error {
	if config.PrivateKeyPath != "" {
		return s.connectOpenSSH(config)
	}

	var authMethods []ssh.AuthMethod

	if config.PrivateKey != "" {
		signer, err := ssh.ParsePrivateKey([]byte(config.PrivateKey))
		if err != nil {
			return apperror.DecryptionFailed(err)
		}
		authMethods = append(authMethods, ssh.PublicKeys(signer))
	}

	if config.Password != "" {
		authMethods = append(authMethods, ssh.Password(config.Password))
	}

	clientConfig := &ssh.ClientConfig{
		User: config.Username,
		Auth: authMethods,
		// TODO proper host key handling
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         timeout,
	}

	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	client, err := ssh.Dial("tcp", addr, clientConfig)
	if err != nil {
		return apperror.SSHConnectionFailed(fmt.Sprintf("failed to connect to %s", addr), err)
	}

	session, err := client.NewSession()
	if err != nil {
		_ = client.Close()
		return apperror.SSHConnectionFailed("failed to create session", err)
	}

	stdin, err := session.StdinPipe()
	if err != nil {
		_ = session.Close()
		_ = client.Close()
		return err
	}

	stdout, err := session.StdoutPipe()
	if err != nil {
		_ = session.Close()
		_ = client.Close()
		return err
	}

	session.Stderr = session.Stdout

	modes := ssh.TerminalModes{
		ssh.ECHO:          1,
		ssh.TTY_OP_ISPEED: 115200, // baud rate
		ssh.TTY_OP_OSPEED: 115200,
	}

	// 24x80 is just the default
	if err = session.RequestPty("xterm-256color", 24, 80, modes); err != nil {
		_ = session.Close()
		_ = client.Close()
		return apperror.SSHConnectionFailed("failed to request PTY", err)
	}

	if err = session.Shell(); err != nil {
		_ = session.Close()
		_ = client.Close()
		return apperror.SSHConnectionFailed("failed to start shell", err)
	}

	s.mu.Lock()
	currentSession := &activeSession{
		client:  client,
		session: session,
		stdin:   stdin,
	}
	s.sessions[config.ID] = currentSession
	s.mu.Unlock()

	go s.streamOutput(config.ID, stdout, currentSession)

	return nil
}

// Input writes data to SSH stdin
func (s *SshService) Input(sessionID string, data string) error {
	s.mu.RLock()
	active, exists := s.sessions[sessionID]
	s.mu.RUnlock()

	if !exists {
		return apperror.SSHSessionNotFound()
	}

	_, err := active.stdin.Write([]byte(data))
	return err
}

func (s *SshService) Resize(sessionID string, rows, cols int) error {
	s.mu.RLock()
	active, exists := s.sessions[sessionID]
	s.mu.RUnlock()

	if !exists {
		return apperror.SSHSessionNotFound()
	}

	if active.pty != nil {
		return pty.Setsize(active.pty, &pty.Winsize{Rows: uint16(rows), Cols: uint16(cols)})
	}

	return active.session.WindowChange(rows, cols)
}

func (s *SshService) Disconnect(sessionID string) {
	s.mu.Lock()
	active, exists := s.sessions[sessionID]
	if exists {
		delete(s.sessions, sessionID)
	}
	s.mu.Unlock()

	if exists {
		if active.session != nil {
			_ = active.session.Close()
		}
		if active.client != nil {
			_ = active.client.Close()
		}
		if active.pty != nil {
			_ = active.pty.Close()
		}
		if active.cmd != nil && active.cmd.Process != nil {
			_ = active.cmd.Process.Kill()
		}
		s.emitter.EmitClosed(sessionID)
	}
}

func (s *SshService) streamOutput(sessionID string, stdout io.Reader, current *activeSession) {
	buf := make([]byte, 32*1024)
	dataChan := make(chan []byte)

	go readOutput(stdout, buf, dataChan)

	batchDelay := time.Second / time.Duration(batchRatePerSecond)
	ticker := time.NewTicker(batchDelay)
	defer ticker.Stop()

	batchSize := 128 * 1024
	batch := make([]byte, 0, batchSize)

	for {
		select {
		case chunk, ok := <-dataChan:
			if !ok {
				if len(batch) > 0 {
					s.emitter.EmitData(sessionID, batch)
				}
				s.cleanupSession(sessionID, current)
				return
			}

			batch = append(batch, chunk...)

			if len(batch) >= batchSize {
				s.emitter.EmitData(sessionID, batch)
				batch = batch[:0]
			}

		case <-ticker.C:
			if len(batch) > 0 {
				s.emitter.EmitData(sessionID, batch)
				batch = batch[:0]
			}
		}
	}
}

func readOutput(stdout io.Reader, buf []byte, dataChan chan []byte) {
	for {
		n, err := stdout.Read(buf)
		if n > 0 {
			chunk := make([]byte, n)
			copy(chunk, buf[:n])
			dataChan <- chunk
		}
		if err != nil {
			close(dataChan)
			return
		}
	}
}

func (s *SshService) cleanupSession(sessionID string, current *activeSession) {
	s.mu.Lock()
	active, exists := s.sessions[sessionID]
	if exists && active == current {
		delete(s.sessions, sessionID)
		s.mu.Unlock()

		if current.session != nil {
			_ = current.session.Close()
		}
		if current.client != nil {
			_ = current.client.Close()
		}
		if current.pty != nil {
			_ = current.pty.Close()
		}
		if current.cmd != nil && current.cmd.Process != nil {
			_ = current.cmd.Process.Kill()
		}
		s.emitter.EmitClosed(sessionID)
	} else {
		s.mu.Unlock()
	}
}
