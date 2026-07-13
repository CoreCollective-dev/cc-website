import crypto from 'crypto';

// Pulls a secret string from your environment, or falls back to a default for local testing
const ENCRYPTION_KEY = import.meta.env.ENCRYPTION_KEY || 'abcdefghijklmnopqrstuvwxyz123456'; 
const IV_LENGTH = 16; 

export function encryptState(email: string, code: string, expiresAt: number): string {
  const text = `${email}:${code}:${expiresAt}`;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptState(encryptedData: string): { email: string; code: string; expiresAt: number } | null {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const [email, code, expiresAt] = decrypted.toString().split(':');
    return { email, code, expiresAt: parseInt(expiresAt, 10) };
  } catch (error) {
    return null; 
  }
}
