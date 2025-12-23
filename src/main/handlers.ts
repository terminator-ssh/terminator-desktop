import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from './database/client'
import { Host, SavedKey, IPC } from '../shared/types'
import { authService } from './services/AuthService'
import { syncService } from './services/SyncService' // <--- ADDED THIS
import { appState } from './state'
import { encryptAES, decryptAES, packBlob, unpackBlob } from './lib/crypto'

export function registerHandlers() {

  // --- AUTH ---
  ipcMain.handle('auth:check', () => authService.hasUser())
  ipcMain.handle('auth:register', (_, { username, password }) => authService.register(username, password))
  ipcMain.handle('auth:login', (_, { password }) => authService.login(password))

  // --- SYNC ---
  ipcMain.handle('sync:register', (_, url) => syncService.registerOnServer(url));
  ipcMain.handle('sync:now', () => syncService.sync());

  // --- HOSTS ---

  // GET HOSTS
  ipcMain.handle(IPC.HOSTS.GET, async () => {
    const mk = appState.getMasterKey();

    const blobs = await prisma.encryptedBlob.findMany({ where: { isDeleted: false } })
    const hosts: Host[] = []

    for (const row of blobs) {
      try {
        const { iv, ciphertext, tag } = unpackBlob(row.blob);
        const jsonBuf = decryptAES(ciphertext, iv, tag, mk);
        const data = JSON.parse(jsonBuf.toString('utf-8'));

        if (data.host) {
          hosts.push({ ...data, id: row.id });
        }
      } catch (e) { }
    }
    return hosts
  })

  // SAVE HOST
  ipcMain.handle(IPC.HOSTS.SAVE, async (_, host: Host) => {
    const mk = appState.getMasterKey();
    const id = host.id || uuidv4();

    const json = JSON.stringify({ ...host, id });
    const { ciphertext, iv, tag } = encryptAES(Buffer.from(json), mk);
    const blob = packBlob(iv, ciphertext, tag);

    await prisma.encryptedBlob.upsert({
      where: { id },
      update: { blob, updatedAt: new Date(), iv },
      create: {
        id,
        blob,
        iv,
        updatedAt: new Date(),
        isDeleted: false
      }
    })
    return { success: true, id }
  })

  // --- KEYS ---

  // GET KEYS
  ipcMain.handle(IPC.KEYS.GET, async () => {
    const mk = appState.getMasterKey();
    const blobs = await prisma.encryptedBlob.findMany({ where: { isDeleted: false } })
    const keys: SavedKey[] = []

    for (const row of blobs) {
      try {
        const { iv, ciphertext, tag } = unpackBlob(row.blob);
        const jsonBuf = decryptAES(ciphertext, iv, tag, mk);
        const data = JSON.parse(jsonBuf.toString('utf-8'));

        if (data.privateKey && !data.host) {
          keys.push({ ...data, id: row.id });
        }
      } catch (e) {}
    }
    return keys
  })

  // SAVE KEY
  ipcMain.handle(IPC.KEYS.SAVE, async (_, key: SavedKey) => {
    const mk = appState.getMasterKey();
    const id = key.id || uuidv4();

    const json = JSON.stringify({ ...key, id });
    const { ciphertext, iv, tag } = encryptAES(Buffer.from(json), mk);
    const blob = packBlob(iv, ciphertext, tag);

    await prisma.encryptedBlob.upsert({
      where: { id },
      update: { blob, updatedAt: new Date(), iv },
      create: {
        id,
        blob,
        iv,
        updatedAt: new Date(),
        isDeleted: false
      }
    })
    return { success: true, id }
  })

  // --- SHARED ---
  ipcMain.handle(IPC.HOSTS.DELETE, async (_, id) => deleteBlob(id))
  ipcMain.handle(IPC.KEYS.DELETE, async (_, id) => deleteBlob(id))
}

async function deleteBlob(id: string) {
  await prisma.encryptedBlob.update({
    where: { id },
    data: { isDeleted: true, updatedAt: new Date() }
  })
  return true
}
