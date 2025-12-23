import { prisma } from '../database/client';
import { deriveKEK, encryptAES, decryptAES } from '../lib/crypto';
import { appState } from '../state';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {

  async hasUser(): Promise<boolean> {
    const count = await prisma.user.count();
    return count > 0;
  }

  async register(username: string, password: string) {
    // 1. Generate Randoms
    const masterKey = crypto.randomBytes(32);
    const keySalt = crypto.randomBytes(16).toString('base64');
    const authSalt = crypto.randomBytes(16).toString('base64');

    // 2. Derive Keys (PDF Page 7)
    // KEK = argon2(password, keySalt)
    const kek = await deriveKEK(password, keySalt);

    // Login Key = argon2(password, authSalt)
    // We reuse deriveKEK because the algorithm (Argon2) is the same, just different salt
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    // 3. Encrypt Master Key
    const { ciphertext, iv, tag } = encryptAES(masterKey, kek);
    const packedEncryptedMK = Buffer.concat([
      Buffer.from(iv, 'base64'),
      Buffer.from(ciphertext, 'base64'),
      Buffer.from(tag, 'base64')
    ]).toString('base64');

    // 4. Save to DB
    await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        keySalt,
        authSalt,
        encryptedMasterKey: packedEncryptedMK,
        loginHash: "TODO_HASH" // If you want offline checks later
      }
    });

    // 5. Unlock App & Store Login Key for Sync
    appState.setKeys(masterKey, loginKey);
    return true;
  }

  async login(password: string) {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("NO_USER");

    // 1. Derive Keys
    const kek = await deriveKEK(password, user.keySalt);

    // Use authSalt if it exists (it might be null in your schema, but PDF says generate it on register)
    const authSalt = user.authSalt || "";
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    // 2. Unpack & Decrypt Master Key
    const buf = Buffer.from(user.encryptedMasterKey, 'base64');
    const iv = buf.subarray(0, 12).toString('base64');
    const tag = buf.subarray(buf.length - 16).toString('base64');
    const ciphertext = buf.subarray(12, buf.length - 16).toString('base64');

    try {
      const masterKey = decryptAES(ciphertext, iv, tag, kek);
      // Unlock App
      appState.setKeys(masterKey, loginKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const authService = new AuthService();
