package blob

import (
	"context"
	"encoding/json"
	"terminator-desktop/backend/internal/crypto"
	"terminator-desktop/backend/internal/dbgen"
	"terminator-desktop/backend/internal/vault"
	"time"

	"github.com/google/uuid"
)

func saveItem[T any](ctx context.Context, q *dbgen.Queries, v *vault.Vault, id string, item T) (string, error) {
	mk, err := v.GetMasterKey()
	if err != nil {
		return "", err
	}

	if id == "" {
		id = uuid.New().String()
	}

	jsonBytes, err := json.Marshal(item)
	if err != nil {
		return "", err
	}

	packedBlob, err := crypto.EncryptAndPack(jsonBytes, mk)
	if err != nil {
		return "", err
	}

	err = q.UpsertBlob(ctx, dbgen.UpsertBlobParams{
		ID:        id,
		Blob:      packedBlob,
		UpdatedAt: time.Now().UTC().Format(time.RFC3339Nano),
		IsDeleted: false,
	})

	return id, err
}

func getAllItems[T any](ctx context.Context, q *dbgen.Queries, v *vault.Vault, expectedType ItemType) ([]T, error) {
	mk, err := v.GetMasterKey()
	if err != nil {
		return nil, err
	}

	blobs, err := q.GetActiveBlobs(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]T, 0)

	for _, b := range blobs {
		decryptedJSON, err := crypto.UnpackAndDecrypt(b.Blob, mk)
		if err != nil {
			continue
		}

		var header VaultItemHeader
		err = json.Unmarshal(decryptedJSON, &header)

		if err == nil && header.Type == expectedType {
			var item T
			err = json.Unmarshal(decryptedJSON, &item)

			if err == nil {
				items = append(items, item)
			}
		}
	}

	return items, nil
}

func deleteItem(ctx context.Context, q *dbgen.Queries, id string) error {
	return q.SoftDeleteBlob(ctx, dbgen.SoftDeleteBlobParams{
		ID:        id,
		UpdatedAt: time.Now().UTC().Format(time.RFC3339Nano),
	})
}
