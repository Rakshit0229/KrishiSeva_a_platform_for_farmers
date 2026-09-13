import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96 bits standard for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128 bits
const PREFIX = 'enc:v1:';

// 256-bit encryption key derived from environment or secure cryptographic salt
function getMasterEncryptionKey(): Buffer {
  const secret = process.env.DATA_ENCRYPTION_KEY || 'krishiseva_secure_master_data_encryption_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * 1. Encrypt Sensitive Data at Rest (AES-256-GCM)
 * Encrypts sensitive fields (Aadhaar, Bank Account, IFSC, Phone) with authenticated encryption
 */
export function encryptSensitiveData(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') {
    return plaintext;
  }

  // Idempotent: don't double-encrypt
  if (plaintext.startsWith(PREFIX)) {
    return plaintext;
  }

  const key = getMasterEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${PREFIX}${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypt Sensitive Data with GCM Authentication Tag Verification
 * Throws if ciphertext has been tampered with
 */
export function decryptSensitiveData(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return ciphertext;
  }

  if (!ciphertext.startsWith(PREFIX)) {
    return ciphertext; // Plaintext fallback
  }

  const parts = ciphertext.slice(PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getMasterEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/**
 * 3. Minimize Personal Data Collection & Response Masking
 * Safely masks PII for presentation and API responses
 */
export function maskPII(value: string | null | undefined, visibleEnd: number = 4, maskChar: string = 'X'): string {
  if (!value) return '';
  const clean = value.toString().trim();
  if (clean.length <= visibleEnd) return clean;

  const maskedPortion = maskChar.repeat(Math.max(clean.length - visibleEnd, 4));
  const visiblePortion = clean.slice(-visibleEnd);
  return `${maskedPortion}${visiblePortion}`;
}

/**
 * Masks Aadhaar number according to UIDAI standard format: XXXX-XXXX-1234
 */
export function maskAadhaar(last4OrFull: string): string {
  if (!last4OrFull) return '';
  const clean = last4OrFull.replace(/\D/g, '');
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Masks Bank Account: XXXXXXXX1234
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s/g, '');
  const last4 = clean.slice(-4);
  return `XXXXXXXX${last4}`;
}
