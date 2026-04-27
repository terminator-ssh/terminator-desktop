package ssh

import (
	"fmt"
	"io"
	"log/slog"
	"sync"
	"terminator-desktop/backend/internal/apperror"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHEmitter interface {
	EmitData(sessionID string, data string)
	EmitClosed(sessionID string)
}

type SSHConnectionConfig struct {
	ID         string `json:"id"`
	Host       string `json:"host"`
	Port       int    `json:"port"`
	Username   string `json:"username"`
	Password   string `json:"password,omitempty"`
	PrivateKey string `json:"privateKey,omitempty"`
}

type activeSession struct {
	client  *ssh.Client
	session *ssh.Session
	stdin   io.WriteCloser
}

type SshService struct {
	emitter  SSHEmitter
	mu       sync.RWMutex
	sessions map[string]*activeSession
}

// TODO: configurable timeout?
const timeout = 15 * time.Second

func NewSshService(emitter SSHEmitter) *SshService {
	return &SshService{
		emitter:  emitter,
		sessions: make(map[string]*activeSession),
	}
}

func (s *SshService) Connect(config *SSHConnectionConfig) error {
	var authMethods []ssh.AuthMethod

	if config.PrivateKey != "" {
		signer, err := ssh.ParsePrivateKey([]byte(config.PrivateKey))
		if err != nil {
			return apperror.DecryptionFailed(err)
		}
		authMethods = append(authMethods, ssh.PublicKeys(signer))
	} else if config.Password != "" {
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
	s.sessions[config.ID] = &activeSession{
		client:  client,
		session: session,
		stdin:   stdin,
	}
	s.mu.Unlock()

	go s.streamOutput(config.ID, stdout)

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
		_ = active.session.Close()
		_ = active.client.Close()
		s.emitter.EmitClosed(sessionID)
	}
}

func (s *SshService) streamOutput(sessionID string, stdout io.Reader) {
	buf := make([]byte, 4096)

	for {
		n, err := stdout.Read(buf)
		if n > 0 {
			s.emitter.EmitData(sessionID, string(buf[:n]))
		}

		if err != nil {
			slog.Info("failed to read data, disconnecting", "error", err)
			s.Disconnect(sessionID)
			return
		}
	}
}
