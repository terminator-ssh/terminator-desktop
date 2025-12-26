import axios from 'axios'
import { gt, eq } from 'drizzle-orm'
import { db } from '../database/client'
import { users, encryptedBlobs } from '../database/schema'
import { appState } from '../state'
import { BrowserWindow } from 'electron';
import {SyncStatus} from "../../shared/types";

export class SyncService {
  private token: string | null = null
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private broadcastStatus(status: SyncStatus) {
    BrowserWindow.getAllWindows().forEach(win => {
      if(!win.isDestroyed()) win.webContents.send('sync:status', status);
    });
  }

  private broadcastDataUpdate() {
    BrowserWindow.getAllWindows().forEach(win => {
      if(!win.isDestroyed()) win.webContents.send('sync:updates-available');
    });
  }

  public startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.sync().catch(console.error);
    this.syncInterval = setInterval(() => {
      this.sync().catch(console.error);
    }, 3000);
  }

  public stopAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = null;
  }

  private async getUser() {
    return await db.query.users.findFirst();
  }

  async authenticate() {
    const user = await this.getUser();
    if (!user || !user.serverUrl) return false;

    try {
      const loginKey = appState.getLoginKey();
      const response = await axios.post(`${user.serverUrl}/Auth/login`, {
        username: user.username,
        loginKey: loginKey
      })
      this.token = response.data.accessToken;
      return true;
    } catch (e) {
      console.error("Sync Auth Failed", e);
      this.broadcastStatus('error');
      return false;
    }
  }

  async sync() {
    if (!appState.isUnlocked()) return;

    const user = await this.getUser();
    if (!user?.serverUrl) {
      this.broadcastStatus('idle');
      return;
    }

    if (this.isSyncing) return;
    this.isSyncing = true;
    this.broadcastStatus('syncing');

    try {
      if (!this.token) {
        const success = await this.authenticate();
        if (!success) {
          this.isSyncing = false;
          return;
        }
      }

      const lastSyncTime = user.lastSyncTime || new Date(0).toISOString();

      const SYNC_OVERLAP_MS = 60 * 60 * 1000;
      const safeCursor = new Date(new Date(lastSyncTime).getTime() - SYNC_OVERLAP_MS).toISOString();

      const localChanges = await db
        .select()
        .from(encryptedBlobs)
        .where(gt(encryptedBlobs.updatedAt, safeCursor));

      const response = await axios.post(`${user.serverUrl}/Sync`, {
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
      });

      const incomingBlobs = response.data.blobs;

      if (incomingBlobs.length > 0) {
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
        this.broadcastDataUpdate();
      }

      await db.update(users)
        .set({ lastSyncTime: response.data.syncTime })
        .where(eq(users.id, user.id));

      this.broadcastStatus('success');
      console.log(`Sync Complete at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => this.broadcastStatus('idle'), 3000);

    } catch (e) {
      console.error("Sync Request Failed", e);

      if (axios.isAxiosError(e) && e.response?.status === 401) {
        console.warn("Sync Unauthorized (401). Clearing token.");
        this.token = null;
        this.broadcastStatus('unauthenticated');
      } else {
        this.broadcastStatus('error');
      }
    } finally {
      this.isSyncing = false;
    }
  }

  async registerOnServer(serverUrl: string) {
    const user = await this.getUser();
    if (!user) throw new Error("No local user found");
    if (!appState.isUnlocked()) throw new Error("Vault locked");

    const loginKey = appState.getLoginKey();

    try {
      this.broadcastStatus('syncing');

      await axios.post(`${serverUrl}/auth/register`, {
        username: user.username,
        authSalt: user.authSalt,
        keySalt: user.keySalt,
        loginKey: loginKey,
        encryptedMasterKey: user.encryptedMasterKey
      });

      await db.update(users)
        .set({ serverUrl: serverUrl, lastSyncTime: new Date(0).toISOString() })
        .where(eq(users.id, user.id));

      console.log("Registered on server successfully");
      this.broadcastStatus('success');
      this.startAutoSync();
      return true;
    } catch (e: any) {
      this.broadcastStatus('error');
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
