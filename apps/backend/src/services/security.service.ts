import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-memory brute force tracker (IP & Identifier)
interface LoginAttemptRecord {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const loginAttempts: Map<string, LoginAttemptRecord> = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// Commonly compromised passwords dictionary (OWASP Top List)
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', 'qwerty123', 'admin123',
  'krishi123', 'kisan123', 'welcome123', 'pass1234', 'farmer123',
  'iloveyou', 'sunshine', 'princess', 'football', 'monkey123',
  '123456789', 'letmein123', 'trustno1', 'dragon123', 'master123'
]);

/**
 * 1. Strong Password Policy Validator
 * Requires:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special symbol
 * - Not in common passwords list
 */
export function validatePasswordPolicy(password: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters in length' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    return {
      isValid: false,
      error: 'Password must contain a combination of uppercase letters, lowercase letters, numbers, and special symbols (!@#$%^&*).'
    };
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { isValid: false, error: 'This password is too commonly used. Please select a unique, strong password.' };
  }

  return { isValid: true };
}

/**
 * 4. Secure Password Storage with Bcrypt
 * Uses work factor 12 for strong brute-force resistance
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return await bcrypt.compare(password, hash);
}

/**
 * 5. Account Lockout Policies (Prevent Brute-Force Attacks)
 */
export function checkAccountLockout(identifier: string): { isLocked: boolean; remainingSeconds?: number } {
  const key = identifier.toLowerCase().trim();
  const record = loginAttempts.get(key);

  if (!record) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout expired, reset attempts
  if (record.lockedUntil && record.lockedUntil <= now) {
    loginAttempts.delete(key);
    return { isLocked: false };
  }

  return { isLocked: false };
}

export function recordFailedLogin(identifier: string): { isNowLocked: boolean; attemptsLeft: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  let record = loginAttempts.get(key);

  if (!record) {
    record = { attempts: 0, lockedUntil: null, lastAttempt: now };
    loginAttempts.set(key, record);
  }

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { isNowLocked: true, attemptsLeft: 0 };
  }

  return { isNowLocked: false, attemptsLeft: MAX_ATTEMPTS - record.attempts };
}

export function resetLoginAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  loginAttempts.delete(key);
}

/**
 * 6. Secure Random Cryptographic Tokens (Reset & Verification)
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * 2. Secure Session Cookie Options
 * HTTP-Only, SameSite, Secure flag in production
 */
export function getSecureCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
}

/**
 * 3. Multi-Factor Authentication (RFC 6238 Standard TOTP Implementation)
 * Provides 2-step verification using Google Authenticator / Authy / Microsoft Authenticator
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateMfaSecret(): string {
  const bytes = crypto.randomBytes(20);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bits: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    for (let b = 4; b >= 0; b--) {
      bits.push((val >> b) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i + b];
    }
    bytes.push(byte);
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secretBase32: string, timeStepWindow: number = 0): string {
  const key = base32ToBuffer(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + timeStepWindow;

  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuf);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

export function verifyTotpCode(secretBase32: string, token: string): boolean {
  if (!secretBase32 || !token) return false;
  const trimmed = token.trim();
  // Allow a +/- 1 step window (past 30s, current, future 30s) to absorb slight clock drifts
  for (const step of [0, -1, 1]) {
    if (generateTotpCode(secretBase32, step) === trimmed) {
      return true;
    }
  }
  return false;
}
