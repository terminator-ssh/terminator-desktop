import axios from 'axios'
import { gt, eq } from 'drizzle-orm'
import { db } from '../database/client'
import { users, encryptedBlobs } from '../database/schema'
import { appState } from '../state'

export class SyncService {
  private token: string | null = null

  private async getServerUrl(): Promise<string | null> {
    const user = await db.query.users.findFirst();
    return user?.serverUrl || null;
  }

  async authenticate() {
    const user = await db.query.users.findFirst();
    if (!user || !user.serverUrl) return;

    try {
      const loginKey = appState.getLoginKey();
      const response = await axios.post(`${user.serverUrl}/auth/login`, {
        username: user.username,
        loginKey: loginKey
      })
      this.token = response.data.accessToken
    } catch (e) {
      console.error("Sync Auth Failed", e)
    }
  }

  async sync() {
    if (!appState.isUnlocked()) return;

    const serverUrl = await this.getServerUrl();
    if (!serverUrl) return;

    if (!this.token) await this.authenticate()
    if (!this.token) return

    const lastSyncRow = await db.query.encryptedBlobs.findFirst({
      orderBy: (blobs, { desc }) => [desc(blobs.updatedAt)]
    });

    const lastSyncTime = lastSyncRow?.updatedAt || new Date(0).toISOString();

    const localChanges = await db
      .select()
      .from(encryptedBlobs)
      .where(gt(encryptedBlobs.updatedAt, lastSyncTime));

    try {
      const response = await axios.post(`${serverUrl}/sync`, {
        blobs: localChanges.map(b => ({
          id: b.id,
          updatedAt: b.updatedAt,
          iv: b.iv,
          isDeleted: b.isDeleted,
          blob: b.blob,
          versionId: b.versionId
        })),
        lastSyncTime: lastSyncTime
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      })

      const incomingBlobs = response.data.blobs

      for (const incoming of incomingBlobs) {
        await db.insert(encryptedBlobs).values({
          id: incoming.id,
          blob: incoming.blob,
          iv: incoming.iv,
          isDeleted: incoming.isDeleted,
          updatedAt: incoming.updatedAt,
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
    const user = await db.query.users.findFirst();
    if (!user) throw new Error("No local user found");
    if (!appState.isUnlocked()) throw new Error("Vault locked");

    const loginKey = appState.getLoginKey();

    try {
      await axios.post(`${serverUrl}/auth/register`, {
        username: user.username,
        authSalt: user.authSalt,
        keySalt: user.keySalt,
        loginKey: loginKey,
        encryptedMasterKey: user.encryptedMasterKey
      });

      await db.update(users)
        .set({ serverUrl: serverUrl })
        .where(eq(users.id, user.id));

      console.log("Registered on server successfully");
      return true;
    } catch (e: any) {
      console.error("Server Registration Failed", e);
      if (axios.isAxiosError(e) && e.response?.data?.errors) {
        const apiMessage = e.response.data.errors[0]?.message;
        if (apiMessage) throw new Error(apiMessage);
      }
      throw e;
    }
  }
}

export const syncService = new SyncService()
