import axios from 'axios'
import { gt } from 'drizzle-orm'
import { db } from '../database/client'
import { encryptedBlobs } from '../database/schema'
import { appState } from '../state'

export class SyncService {
  private baseUrl: string = 'http://localhost:5000/api/v1'
  private token: string | null = null

  async authenticate() {
    const user = await db.query.users.findFirst();
    if (!user) return

    try {
      // PDF Page 21: POST /api/v1/auth/login
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

    // 1. Get last sync time (latest local update)
    // Drizzle: SELECT * FROM encrypted_blobs ORDER BY updated_at DESC LIMIT 1
    const lastSyncRow = await db.query.encryptedBlobs.findFirst({
      orderBy: (blobs, { desc }) => [desc(blobs.updatedAt)]
    });

    const lastSyncTime = lastSyncRow?.updatedAt || new Date(0).toISOString();

    // 2. Collect local changes
    // Drizzle: SELECT * FROM encrypted_blobs WHERE updated_at > lastSyncTime
    const localChanges = await db
      .select()
      .from(encryptedBlobs)
      .where(gt(encryptedBlobs.updatedAt, lastSyncTime));

    try {
      // 3. Push to Server
      const response = await axios.post(`${this.baseUrl}/sync`, {
        blobs: localChanges.map(b => ({
          id: b.id,
          updatedAt: b.updatedAt, // Already string in Drizzle/SQLite
          iv: b.iv,
          isDeleted: b.isDeleted, // Drizzle handles 0/1 -> boolean conversion
          blob: b.blob,
          versionId: b.versionId
        })),
        lastSyncTime: lastSyncTime
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })

      // 4. Process incoming blobs
      const incomingBlobs = response.data.blobs

      for (const incoming of incomingBlobs) {
        // Drizzle Upsert
        await db.insert(encryptedBlobs).values({
          id: incoming.id,
          blob: incoming.blob,
          iv: incoming.iv,
          isDeleted: incoming.isDeleted,
          updatedAt: incoming.updatedAt, // Server sends ISO string
          versionId: incoming.versionId
        }).onConflictDoUpdate({
          target: encryptedBlobs.id,
          set: {
            blob: incoming.blob,
            iv: incoming.iv,
            isDeleted: incoming.isDeleted,
            updatedAt: incoming.updatedAt,
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
    const user = await db.query.users.findFirst();
    if (!user) throw new Error("No local user found");

    // 2. Get the LoginKey
    if (!appState.isUnlocked()) throw new Error("Vault locked");
    const loginKey = appState.getLoginKey();

    try {
      // PDF Page 20: /api/v1/auth/register
      await axios.post(`${serverUrl}/auth/register`, {
        username: user.username,
        authSalt: user.authSalt,
        keySalt: user.keySalt,
        loginKey: loginKey,
        encryptedMasterKey: user.encryptedMasterKey
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
