-- name: GetActiveBlobs :many
SELECT * FROM encrypted_blobs
WHERE is_deleted = 0;

-- name: GetBlobsSince :many
SELECT * FROM encrypted_blobs
WHERE updated_at > ?;

-- name: UpsertBlob :exec
INSERT INTO encrypted_blobs (
    id, blob, updated_at, is_deleted
) VALUES (
    ?, ?, ?, ?
)
ON CONFLICT(id) DO UPDATE SET
    blob = excluded.blob,
    updated_at = excluded.updated_at,
    is_deleted = excluded.is_deleted;

-- name: SoftDeleteBlob :exec
UPDATE encrypted_blobs
SET is_deleted = 1, updated_at = ?
WHERE id = ?;

-- name: WipeBlobs :exec
DELETE FROM encrypted_blobs;