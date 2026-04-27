package sync

import (
	"context"
	"database/sql"
	"encoding/base64"
	"errors"
	"sync"
	"terminator-desktop/backend/internal/api"
	"terminator-desktop/backend/internal/dbgen"
	"terminator-desktop/backend/internal/vault"
	"time"
)

type SyncStatus string

const (
	SyncStatusIdle            = SyncStatus("idle")
	SyncStatusSyncing         = SyncStatus("syncing")
	SyncStatusSuccess         = SyncStatus("success")
	SyncStatusError           = SyncStatus("error")
	SyncStatusUnauthenticated = SyncStatus("unauthenticated")
)

type SyncEmitter interface {
	EmitStatus(status SyncStatus)
	EmitUpdatesAvailable()
	EmitSyncError(err error)
}

type SyncService struct {
	q            *dbgen.Queries
	client       *api.Client
	vault        *vault.Vault
	emitter      SyncEmitter
	syncInterval time.Duration

	mutex      sync.Mutex
	isSyncing  bool
	cancelSync context.CancelFunc
}

func NewSyncService(
	q *dbgen.Queries,
	client *api.Client,
	v *vault.Vault,
	emitter SyncEmitter,
	syncInterval *time.Duration) *SyncService {

	var interval time.Duration
	if syncInterval == nil {
		interval = time.Second * 3
	} else {
		interval = *syncInterval
	}

	return &SyncService{
		q:            q,
		client:       client,
		vault:        v,
		emitter:      emitter,
		syncInterval: interval,
	}
}

func (s *SyncService) Authenticate(ctx context.Context) error {
	user, err := s.q.GetUser(ctx)
	if err != nil {
		return err
	}

	if !user.ServerUrl.Valid {
		return nil
	}
	serverUrl := user.ServerUrl.String

	loginKey, err := s.vault.GetLoginKey()
	if err != nil {
		return err
	}

	loginKeyBase64 := base64.StdEncoding.EncodeToString(loginKey)

	res, err := s.client.Login(ctx, serverUrl, &api.LoginRequest{
		Username: user.Username,
		LoginKey: loginKeyBase64,
	})
	if err != nil {
		s.emitter.EmitStatus(SyncStatusError)
		return err
	}

	s.client.SetToken(res.AccessToken)
	return nil
}

func (s *SyncService) Sync(ctx context.Context) error {
	if !s.vault.IsUnlocked() {
		return nil
	}

	s.mutex.Lock()
	if s.isSyncing {
		s.mutex.Unlock()
		return nil
	}
	s.isSyncing = true
	s.mutex.Unlock()

	defer func() {
		s.mutex.Lock()
		s.isSyncing = false
		s.mutex.Unlock()
	}()

	s.emitter.EmitStatus(SyncStatusSyncing)

	user, err := s.q.GetUser(ctx)
	if err != nil {
		s.emitter.EmitStatus(SyncStatusError)
		return err
	}

	if !user.ServerUrl.Valid {
		s.emitter.EmitStatus(SyncStatusIdle)
		return nil
	}
	serverUrl := user.ServerUrl.String

	if err = s.Authenticate(ctx); err != nil {
		return err
	}

	epoch := time.Unix(0, 0).UTC().Format(time.RFC3339)
	lastSyncString := epoch

	if user.LastSyncTime.Valid {
		lastSyncString = user.LastSyncTime.String
	}

	lastSyncTime, err := time.Parse(time.RFC3339Nano, lastSyncString)
	if err != nil {
		lastSyncTime, err = time.Parse(time.RFC3339, lastSyncString)
		if err != nil {
			s.emitter.EmitStatus(SyncStatusError)
			return err
		}
	}

	localChanges, err := s.q.GetBlobsSince(ctx, lastSyncString)
	if err != nil {
		s.emitter.EmitStatus(SyncStatusError)
		return err
	}

	apiBlobs := make([]api.EncryptedBlob, 0)
	for _, b := range localChanges {
		parsedTime, err := time.Parse(time.RFC3339Nano, b.UpdatedAt)
		if err != nil {
			s.emitter.EmitStatus(SyncStatusError)
			return err
		}

		apiBlobs = append(apiBlobs, api.EncryptedBlob{
			ID:        b.ID,
			UpdatedAt: parsedTime,
			IsDeleted: b.IsDeleted,
			Blob:      b.Blob,
		})
	}

	req := &api.SyncRequest{
		Blobs:        apiBlobs,
		LastSyncTime: lastSyncTime,
	}

	res, err := s.client.Sync(ctx, serverUrl, req)
	if err != nil {
		var apiErr *api.APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode == 401 {
			s.client.ClearToken()
			s.emitter.EmitStatus(SyncStatusUnauthenticated)
			return err
		}

		s.emitter.EmitStatus(SyncStatusError)
		return err
	}

	if len(res.Blobs) > 0 {
		for _, incoming := range res.Blobs {
			updatedAtStr := incoming.UpdatedAt.Format(time.RFC3339Nano)

			err = s.q.UpsertBlob(ctx, dbgen.UpsertBlobParams{
				ID:        incoming.ID,
				Blob:      incoming.Blob,
				UpdatedAt: updatedAtStr,
				IsDeleted: incoming.IsDeleted,
			})
			if err != nil {
				s.emitter.EmitStatus(SyncStatusError)
				return err
			}
		}
		s.emitter.EmitUpdatesAvailable()
	}

	newSyncTimeStr := res.SyncTime.Format(time.RFC3339Nano)
	err = s.q.UpdateUserLastSyncTime(ctx, dbgen.UpdateUserLastSyncTimeParams{
		LastSyncTime: sql.NullString{String: newSyncTimeStr, Valid: true},
		ID:           user.ID,
	})
	if err != nil {
		s.emitter.EmitStatus(SyncStatusError)
		return err
	}

	s.emitter.EmitStatus(SyncStatusSuccess)

	return nil
}
