import { count } from 'drizzle-orm';
import { db } from '../database/client';
import { users } from '../database/schema';
import { deriveKEK, encryptAES, decryptAES } from '../lib/crypto';
import { appState } from '../state';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {

  async hasUser(): Promise<boolean> {
    const result = await db.select({ value: count() }).from(users);
    return result[0].value > 0;
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
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    // 3. Encrypt Master Key
    const { ciphertext, iv, tag } = encryptAES(masterKey, kek);

    // Pack into one string
    const packedEncryptedMK = Buffer.concat([
      Buffer.from(iv, 'base64'),
      Buffer.from(ciphertext, 'base64'),
      Buffer.from(tag, 'base64')
    ]).toString('base64');

    // 4. Save to DB
    // PDF mentions loginHash = sha256(loginKey).
    // We create a hash so we can verify login locally without decrypting everything if needed
    const loginHash = crypto.createHash('sha256').update(loginKey).digest('hex');

    await db.insert(users).values({
      id: uuidv4(),
      username,
      keySalt,
      authSalt,
      encryptedMasterKey: packedEncryptedMK,
      loginHash
    });

    // 5. Unlock App
    appState.setKeys(masterKey, loginKey);
    return true;
  }

  async login(password: string) {
    const user = await db.query.users.findFirst();

    if (!user) throw new Error("NO_USER");

    // 1. Derive Keys
    const kek = await deriveKEK(password, user.keySalt);

    const authSalt = user.authSalt || "";
    const loginKeyBuf = await deriveKEK(password, authSalt);
    const loginKey = loginKeyBuf.toString('base64');

    // 2. Unpack
    const buf = Buffer.from(user.encryptedMasterKey, 'base64');
    const iv = buf.subarray(0, 12).toString('base64');
    const tag = buf.subarray(buf.length - 16).toString('base64');
    const ciphertext = buf.subarray(12, buf.length - 16).toString('base64');

    // 3. Attempt Decrypt
    try {
      const masterKey = decryptAES(ciphertext, iv, tag, kek);
      appState.setKeys(masterKey, loginKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const authService = new AuthService();
