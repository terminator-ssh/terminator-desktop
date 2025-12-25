import { count } from 'drizzle-orm';
import {db, destroyDatabaseAndRestart} from '../database/client';
import { users } from '../database/schema';
import { deriveKEK, encryptAES, decryptAES } from '../lib/crypto';
import { appState } from '../state';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { syncService } from './SyncService';

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

  async wipeData() {
    destroyDatabaseAndRestart();
  }

  async registerLocal(username: string, password: string) {
    const masterKey = crypto.randomBytes(32);
    const keySalt = crypto.randomBytes(16).toString('base64');
    const authSalt = crypto.randomBytes(16).toString('base64');

    const kek = await deriveKEK(password, keySalt);
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    const { ciphertext, iv, tag } = encryptAES(masterKey, kek);
    const packedEncryptedMK = Buffer.concat([
      Buffer.from(iv, 'base64'),
      Buffer.from(ciphertext, 'base64'),
      Buffer.from(tag, 'base64')
    ]).toString('base64');

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

      const buf = Buffer.from(encryptedMasterKey, 'base64');
      const iv = buf.subarray(0, 12).toString('base64');
      const tag = buf.subarray(buf.length - 16).toString('base64');
      const ciphertext = buf.subarray(12, buf.length - 16).toString('base64');

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

    const buf = Buffer.from(user.encryptedMasterKey, 'base64');
    const iv = buf.subarray(0, 12).toString('base64');
    const tag = buf.subarray(buf.length - 16).toString('base64');
    const ciphertext = buf.subarray(12, buf.length - 16).toString('base64');

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
