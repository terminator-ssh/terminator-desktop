import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  username: text('username').notNull(),
  keySalt: text('key_salt').notNull(),
  authSalt: text('auth_salt'),
  encryptedMasterKey: text('encrypted_master_key').notNull(),
  loginHash: text('login_hash').notNull(),
});

export const encryptedBlobs = sqliteTable('encrypted_blobs', {
  id: text('id').primaryKey(), // UUID
  blob: text('blob').notNull(), // Base64
  iv: text('iv').notNull(),
  // Store dates as ISO strings in SQLite
  updatedAt: text('updated_at').notNull(),
  // SQLite uses 0/1 for booleans, Drizzle handles the conversion
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  versionId: text('version_id'),
});
