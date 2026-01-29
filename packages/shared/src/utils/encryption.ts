import crypto from 'node:crypto';

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function encryptSecret(plaintext: string, base64Key: string): string {
  const key = Buffer.from(base64Key, 'base64');
  if (key.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptSecret(payload: string, base64Key: string): string {
  const key = Buffer.from(base64Key, 'base64');
  if (key.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  }
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = raw.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
