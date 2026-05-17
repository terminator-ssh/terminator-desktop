package sync

import (
	"context"
	"errors"
	"log/slog"
	"time"
)

func (s *SyncService) StartAutoSync() {
	s.mutex.Lock()
	if s.cancelSync != nil {
		s.cancelSync()
	}
	ctx, cancel := context.WithCancel(context.Background())
	s.cancelSync = cancel
	s.mutex.Unlock()

	go func() {
		ticker := time.NewTicker(s.syncInterval)
		defer ticker.Stop()

		sync := func() {
			err := s.Sync(ctx)
			if err != nil {
				if !errors.Is(err, context.Canceled) {
					slog.Error("background sync failed", "error", err)
					s.emitter.EmitSyncError(err)
					s.emitter.EmitStatus(SyncStatusError)
				}
			}
		}

		sync()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				sync()
			}
		}
	}()
}

func (s *SyncService) StopAutoSync() {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	if s.cancelSync != nil {
		s.cancelSync()
		s.cancelSync = nil
	}
}
