-- name: HasUser :one
SELECT COUNT(*) FROM users;

-- name: GetUser :one
SELECT * FROM users LIMIT 1;

-- name: CreateUser :exec
INSERT INTO users (
    id, username, key_salt, auth_salt, encrypted_master_key,
    server_url, last_sync_time
) VALUES (
    ?, ?, ?, ?, ?, ?, ?
);

-- name: UpdateUserServerUrl :exec
UPDATE users
SET server_url = ?, last_sync_time = ?
WHERE id = ?;

-- name: UpdateUserLastSyncTime :exec
UPDATE users
SET last_sync_time = ?
WHERE id = ?;

-- name: WipeUsers :exec
DELETE FROM users;


