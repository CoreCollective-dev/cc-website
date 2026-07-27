import crypto from 'crypto';

// Reads COOKIE_SECRET or ENCRYPTION_KEY with a safe 32-byte fallback
const SECRET_RAW =
  import.meta.env.COOKIE_SECRET ||
  import.meta.env.ENCRYPTION_KEY ||
  process.env.COOKIE_SECRET ||
  process.env.ENCRYPTION_KEY ||
  'abcdefghijklmnopqrstuvwxyz123456';

// Ensure key is strictly 32 bytes for aes-256-cbc
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET_RAW).digest();
const IV_LENGTH = 16;

export interface StatePayload {
  email: string;
  code: string;
  expiresAt: number;
  companyName?: string;
  contactName?: string;
  allowedDomains?: string;
  docusignSignatoryEmail?: string;
}

export function encryptState(payload: StatePayload): string {
  const jsonString = JSON.stringify(payload);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptState(encryptedData: string): StatePayload | null {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return null;

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as StatePayload;
  } catch (error) {
    console.error('❌ DECRYPTION ERROR:', error);
    return null;
  }
}

