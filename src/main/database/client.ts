import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import * as schema from './schema'; // Import your tables

const dbPath = app.isPackaged
  ? path.join(app.getPath('userData'), 'terminator.db')
  : path.join(__dirname, '../../dev.db');

const migrationsFolder = app.isPackaged
  ? path.join(process.resourcesPath, 'drizzle')
  : path.join(__dirname, '../../drizzle');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

try {
  migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");
} catch (e) {
  console.error("Migration failed:", e);
}
