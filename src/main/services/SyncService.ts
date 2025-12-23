import axios from 'axios'
import { prisma } from '../database/client'
import { appState } from '../state'

export class SyncService {
  // CHANGE THIS TO YOUR REAL C# API URL
  private baseUrl: string = 'http://localhost:5000/api/v1'
  private token: string | null = null

  async authenticate() {
    const user = await prisma.user.findFirst()
    if (!user) return

    try {
      // PDF Page 21: POST /api/v1/auth/login
      // We use the loginKey we calculated during the local login phase
      const loginKey = appState.getLoginKey();

      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: user.username,
        loginKey: loginKey
      })

      this.token = response.data.accessToken
      console.log("Sync Auth Success")
    } catch (e) {
      console.error("Sync Auth Failed", e)
    }
  }

  async sync() {
    // If vault is locked, we can't sync (we don't have the loginKey)
    if (!appState.isUnlocked()) return;

    if (!this.token) await this.authenticate()
    if (!this.token) return

    // Get last sync time
    const lastSyncRow = await prisma.encryptedBlob.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    const lastSyncTime = lastSyncRow?.updatedAt.toISOString() || new Date(0).toISOString()

    // A. Collect local changes
    const localChanges = await prisma.encryptedBlob.findMany({
      where: { updatedAt: { gt: lastSyncRow?.updatedAt || new Date(0) } }
    })

    try {
      // B. Push to Server
      const response = await axios.post(`${this.baseUrl}/sync`, {
        blobs: localChanges.map(b => ({
          id: b.id,
          updatedAt: b.updatedAt.toISOString(),
          iv: b.iv,
          isDeleted: b.isDeleted,
          blob: b.blob,
          versionId: b.versionId
        })),
        lastSyncTime: lastSyncTime
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })

      // C. Process incoming blobs
      // Note: We don't need to decrypt these to save them. We save them as encrypted blobs.
      const incomingBlobs = response.data.blobs
      for (const incoming of incomingBlobs) {
        await prisma.encryptedBlob.upsert({
          where: { id: incoming.id },
          update: {
            blob: incoming.blob,
            iv: incoming.iv,
            isDeleted: incoming.isDeleted,
            updatedAt: new Date(incoming.updatedAt),
            versionId: incoming.versionId
          },
          create: {
            id: incoming.id,
            blob: incoming.blob,
            iv: incoming.iv,
            isDeleted: incoming.isDeleted,
            updatedAt: new Date(incoming.updatedAt),
            versionId: incoming.versionId
          }
        })
      }
      console.log("Sync Complete")
    } catch (e) {
      console.error("Sync Request Failed", e)
    }
  }

  async registerOnServer(serverUrl: string) {
    // 1. Get Local User Data
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No local user found");

    // 2. Get the LoginKey (Requires app to be unlocked)
    if (!appState.isUnlocked()) throw new Error("Vault locked");
    const loginKey = appState.getLoginKey();

    try {
      // PDF Page 20: /api/v1/auth/register
      // RegisterRequestDto: { username, authSalt, keySalt, loginKey, encryptedMasterKey }
      await axios.post(`${serverUrl}/auth/register`, {
        username: user.username,
        authSalt: user.authSalt,
        keySalt: user.keySalt,
        loginKey: loginKey, // We send this so server can hash it and verify login later
        encryptedMasterKey: user.encryptedMasterKey // Server stores this blob for other devices
      });

      this.baseUrl = serverUrl;
      console.log("Registered on server successfully");
      return true;
    } catch (e) {
      console.error("Server Registration Failed", e);
      throw e;
    }
  }
}

export const syncService = new SyncService()
