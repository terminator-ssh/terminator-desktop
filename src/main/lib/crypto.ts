import argon2 from 'argon2';
import crypto from 'crypto';

const AES_ALGO = 'aes-256-gcm';

export async function deriveKEK(password: string, keySaltBase64: string): Promise<Buffer> {
  return await argon2.hash(password, {
    raw: true,
    salt: Buffer.from(keySaltBase64, 'base64'),
    timeCost: 3,
    memoryCost: 4096,
    parallelism: 1,
    hashLength: 32 // 32 bytes = 256 bits
  });
}

export function encryptAES(data: Buffer, key: Buffer): { ciphertext: string, iv: string, tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv);

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

export function decryptAES(ciphertextB64: string, ivB64: string, tagB64: string, key: Buffer): Buffer {
  const decipher = crypto.createDecipheriv(AES_ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

  let decrypted = decipher.update(Buffer.from(ciphertextB64, 'base64'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

export function packBlob(iv: string, ciphertext: string, tag: string): string {
  const buf = Buffer.concat([
    Buffer.from(iv, 'base64'),
    Buffer.from(ciphertext, 'base64'),
    Buffer.from(tag, 'base64')
  ]);
  return buf.toString('base64');
}

export function unpackBlob(blobB64: string): { iv: string, ciphertext: string, tag: string } {
  const buf = Buffer.from(blobB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ciphertext = buf.subarray(12, buf.length - 16);

  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: tag.toString('base64')
  };
}
