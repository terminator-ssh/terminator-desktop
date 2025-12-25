import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import * as schema from './schema';
import fs from 'fs';

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

export function destroyDatabase() {
  console.log("Stopping database...");
  sqlite.close();

  const files = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];
  files.forEach(f => {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      }
      catch (e) {
        console.error(`Failed to delete ${f}`, e);
      }
    }
  });
}
