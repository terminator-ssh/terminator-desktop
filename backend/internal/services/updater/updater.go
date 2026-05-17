package updater

import (
	"fmt"
	"sync"

	"github.com/quaadgras/velopack-go/velopack"
)

type Emitter interface {
	EmitProgress(percent uint)
}

type UpdateInfo struct {
	IsAvailable bool   `json:"isAvailable"`
	Version     string `json:"version"`
}

type UpdaterService struct {
	updateURL string
	emitter   Emitter
	manager   *velopack.UpdateManager
	latest    *velopack.UpdateInfo
	mu        sync.Mutex
}

func NewUpdaterService(updateURL string, emitter Emitter) *UpdaterService {
	return &UpdaterService{
		updateURL: updateURL,
		emitter:   emitter,
	}
}

func (s *UpdaterService) CheckForUpdates() (*UpdateInfo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	manager, err := velopack.NewUpdateManager(s.updateURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create update manager: %w", err)
	}
	s.manager = manager

	latest, status, err := manager.CheckForUpdates()
	if err != nil {
		return nil, fmt.Errorf("failed to check for updates: %w", err)
	}

	if status == velopack.UpdateAvailable && latest != nil && latest.TargetFullRelease != nil {
		s.latest = latest
		return &UpdateInfo{
			IsAvailable: true,
			Version:     latest.TargetFullRelease.Version,
		}, nil
	}

	s.latest = nil
	return &UpdateInfo{IsAvailable: false}, nil
}

func (s *UpdaterService) DownloadUpdate() error {
	s.mu.Lock()
	manager := s.manager
	latest := s.latest
	s.mu.Unlock()

	if manager == nil || latest == nil {
		return fmt.Errorf("no update pending")
	}

	err := manager.DownloadUpdates(latest, func(progress uint) {
		s.emitter.EmitProgress(progress)
	})
	if err != nil {
		return fmt.Errorf("failed to download update: %w", err)
	}

	return nil
}

func (s *UpdaterService) ApplyAndRestart() error {
	s.mu.Lock()
	manager := s.manager
	latest := s.latest
	s.mu.Unlock()

	if manager == nil || latest == nil {
		return fmt.Errorf("no update pending")
	}

	return manager.ApplyUpdatesAndRestart(latest)
}
