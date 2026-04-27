import { count } from 'drizzle-orm';
import {db, destroyDatabase} from '../database/client';
import { users } from '../database/schema';
import {deriveKEK, encryptAES, decryptAES, packBlob, unpackBlob} from '../lib/crypto';
import { appState } from '../state';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { syncService } from './SyncService';
import {app} from "electron";

export class AuthService {

  async hasUser(): Promise<boolean> {
    const result = await db.select({ value: count() }).from(users);
    return result[0].value > 0;
  }

  async getCurrentUser() {
    const user = await db.query.users.findFirst();
    if (!user) return null;
    return {
      username: user.username,
      serverUrl: user.serverUrl
    };
  }

  async wipeDataAndCloseApp() {
    destroyDatabase();
    app.exit(0);
  }

  async registerLocal(username: string, password: string) {
    const masterKey = crypto.randomBytes(32);
    const keySalt = crypto.randomBytes(16).toString('base64');
    const authSalt = crypto.randomBytes(16).toString('base64');

    const kek = await deriveKEK(password, keySalt);
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    const { ciphertext, iv, tag } = encryptAES(masterKey, kek);
    const packedEncryptedMK = packBlob(iv, ciphertext, tag);

    const loginHash = crypto.createHash('sha256').update(loginKey).digest('hex');

    await db.insert(users).values({
      id: uuidv4(),
      username,
      keySalt,
      authSalt,
      encryptedMasterKey: packedEncryptedMK,
      loginHash,
      serverUrl: null,
      lastSyncTime: new Date(0).toISOString()
    });

    appState.setKeys(masterKey, loginKey);
    syncService.startAutoSync();
    return true;
  }

  async loginFromSync(serverUrl: string, username: string, password: string) {
    try {
      console.log(`[Auth] Preflight to ${serverUrl} for ${username}`);
      const preflight = await axios.post(`${serverUrl}/auth/preflight`, { username });
      const { authSalt, keySalt, encryptedMasterKey } = preflight.data;

      console.log(`[Auth] Salts received. AuthSalt: ${authSalt.substring(0, 10)}... KeySalt: ${keySalt.substring(0, 10)}...`);

      const kek = await deriveKEK(password, keySalt);
      const loginKeyBuf = await deriveKEK(password, authSalt);
      const loginKey = loginKeyBuf.toString('base64');

      console.log(`[Auth] Derived LoginKey: ${loginKey.substring(0, 10)}...`);

      await axios.post(`${serverUrl}/auth/login`, { username, loginKey });
      console.log("[Auth] Server login successful");

      const { iv, ciphertext, tag } = unpackBlob(encryptedMasterKey);

      const masterKey = decryptAES(ciphertext, iv, tag, kek);
      console.log("[Auth] MasterKey decrypted successfully");

      const loginHash = crypto.createHash('sha256').update(loginKey).digest('hex');

      await db.insert(users).values({
        id: uuidv4(),
        username,
        keySalt,
        authSalt,
        encryptedMasterKey,
        loginHash,
        serverUrl,
        lastSyncTime: new Date(0).toISOString()
      });

      appState.setKeys(masterKey, loginKey);
      syncService.startAutoSync();
      return true;

    } catch (e: any) {
      console.error("Sync Login Failed", e);
      if (axios.isAxiosError(e) && e.response?.data?.errors) {
        const apiMessage = e.response.data.errors[0]?.message;
        if (apiMessage) throw new Error(apiMessage);
      }
      throw new Error("Connection failed. Check Server URL.");
    }
  }

  async login(password: string) {
    const user = await db.query.users.findFirst();
    if (!user) throw new Error("NO_USER");

    const kek = await deriveKEK(password, user.keySalt);
    const authSalt = user.authSalt || "";
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    const { iv, ciphertext, tag } = unpackBlob(user.encryptedMasterKey);

    try {
      const masterKey = decryptAES(ciphertext, iv, tag, kek);
      appState.setKeys(masterKey, loginKey);
      syncService.startAutoSync();
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const authService = new AuthService();
