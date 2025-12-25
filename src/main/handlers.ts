import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'
import { db } from './database/client'
import { encryptedBlobs } from './database/schema'
import { Host, SavedKey, IPC } from '../shared/types'
import { authService } from './services/AuthService'
import { syncService } from './services/SyncService'
import { appState } from './state'
import { encryptAES, decryptAES, packBlob, unpackBlob } from './lib/crypto'

const triggerSync = () => {
  syncService.sync().catch(e => console.error("Auto-sync error:", e));
}

export function registerHandlers() {

  ipcMain.handle('auth:me', () => authService.getCurrentUser())
  ipcMain.handle('auth:wipe', () => authService.wipeDataAndCloseApp())
  ipcMain.handle('auth:check', () => authService.hasUser())
  ipcMain.handle('auth:register', (_, { username, password }) => authService.registerLocal(username, password))
  ipcMain.handle('auth:login', (_, { password }) => authService.login(password))
  ipcMain.handle('auth:login-sync', (_, { url, username, password }) => authService.loginFromSync(url, username, password))

  ipcMain.handle('sync:register', (_, url) => syncService.registerOnServer(url));
  ipcMain.handle('sync:now', () => syncService.sync());

  ipcMain.handle(IPC.HOSTS.GET, async () => {
    const mk = appState.getMasterKey();
    const blobs = await db.select().from(encryptedBlobs).where(eq(encryptedBlobs.isDeleted, false));
    const hosts: Host[] = []

    for (const row of blobs) {
      try {
        const { iv, ciphertext, tag } = unpackBlob(row.blob);
        const jsonBuf = decryptAES(ciphertext, iv, tag, mk);
        const data = JSON.parse(jsonBuf.toString('utf-8'));

        if (!data.privateKey) {
          hosts.push({ ...data, id: row.id });
        }
      } catch (e) { }
    }
    return hosts
  })

  ipcMain.handle(IPC.HOSTS.SAVE, async (_, host: Host) => {
    const mk = appState.getMasterKey();
    const id = host.id || uuidv4();

    const { privateKey, ...hostData } = host as any;

    const json = JSON.stringify({ ...hostData, id });
    const { ciphertext, iv, tag } = encryptAES(Buffer.from(json), mk);
    const blob = packBlob(iv, ciphertext, tag);

    await db.insert(encryptedBlobs).values({
      id,
      blob,
      iv,
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }).onConflictDoUpdate({
      target: encryptedBlobs.id,
      set: { blob, updatedAt: new Date().toISOString(), iv }
    });
    triggerSync();
    return { success: true, id }
  })

  ipcMain.handle(IPC.KEYS.GET, async () => {
    const mk = appState.getMasterKey();
    const blobs = await db.select().from(encryptedBlobs).where(eq(encryptedBlobs.isDeleted, false));
    const keys: SavedKey[] = []

    for (const row of blobs) {
      try {
        const { iv, ciphertext, tag } = unpackBlob(row.blob);
        const jsonBuf = decryptAES(ciphertext, iv, tag, mk);
        const data = JSON.parse(jsonBuf.toString('utf-8'));

        if (data.privateKey) {
          keys.push({ ...data, id: row.id });
        }
      } catch (e) {}
    }
    return keys
  })

  ipcMain.handle(IPC.KEYS.SAVE, async (_, key: SavedKey) => {
    const mk = appState.getMasterKey();
    const id = key.id || uuidv4();

    const json = JSON.stringify({ ...key, id });
    const { ciphertext, iv, tag } = encryptAES(Buffer.from(json), mk);
    const blob = packBlob(iv, ciphertext, tag);

    await db.insert(encryptedBlobs).values({
      id,
      blob,
      iv,
      updatedAt: new Date().toISOString(),
      isDeleted: false
    }).onConflictDoUpdate({
      target: encryptedBlobs.id,
      set: { blob, updatedAt: new Date().toISOString(), iv }
    });

    triggerSync();
    return { success: true, id }
  })

  ipcMain.handle(IPC.HOSTS.DELETE, async (_, id) => deleteBlob(id))
  ipcMain.handle(IPC.KEYS.DELETE, async (_, id) => deleteBlob(id))
}

async function deleteBlob(id: string) {
  await db.update(encryptedBlobs)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(encryptedBlobs.id, id));

  triggerSync();
  return true
}
