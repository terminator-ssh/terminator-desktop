package blob

import (
	"context"

	"terminator-desktop/backend/internal/dbgen"
	"terminator-desktop/backend/internal/vault"
)

// wrappers for wails

type HostService struct {
	q *dbgen.Queries
	v *vault.Vault
}

func NewHostService(q *dbgen.Queries, v *vault.Vault) *HostService {
	return &HostService{q: q, v: v}
}

func (s *HostService) Save(ctx context.Context, host Host) (string, error) {
	host.Type = TypeHost // just in case
	return saveItem(ctx, s.q, s.v, host.ID, host)
}

func (s *HostService) GetAll(ctx context.Context) ([]Host, error) {
	return getAllItems[Host](ctx, s.q, s.v, TypeHost)
}

func (s *HostService) Delete(ctx context.Context, id string) error {
	return deleteItem(ctx, s.q, id)
}

type KeyService struct {
	q *dbgen.Queries
	v *vault.Vault
}

func NewKeyService(q *dbgen.Queries, v *vault.Vault) *KeyService {
	return &KeyService{q: q, v: v}
}

func (s *KeyService) Save(ctx context.Context, key SavedKey) (string, error) {
	key.Type = TypeKey // just in case
	return saveItem(ctx, s.q, s.v, key.ID, key)
}

func (s *KeyService) GetAll(ctx context.Context) ([]SavedKey, error) {
	return getAllItems[SavedKey](ctx, s.q, s.v, TypeKey)
}

func (s *KeyService) Delete(ctx context.Context, id string) error {
	return deleteItem(ctx, s.q, id)
}
