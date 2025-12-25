import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  keySalt: text('key_salt').notNull(),
  authSalt: text('auth_salt'),
  encryptedMasterKey: text('encrypted_master_key').notNull(),
  loginHash: text('login_hash').notNull(),
  serverUrl: text('server_url'),
  lastSyncTime: text('last_sync_time'),
});

export const encryptedBlobs = sqliteTable('encrypted_blobs', {
  id: text('id').primaryKey(),
  blob: text('blob').notNull(),
  iv: text('iv').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  versionId: text('version_id'),
});
