CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    key_salt TEXT NOT NULL,
    auth_salt TEXT,
    encrypted_master_key TEXT NOT NULL,
    server_url TEXT,
    last_sync_time TEXT
);

CREATE TABLE IF NOT EXISTS encrypted_blobs (
    id TEXT PRIMARY KEY NOT NULL,
    blob TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT 0
);