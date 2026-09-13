import crypto from 'crypto';
import { memoryStore } from '../db';
import { logAuditAction } from '../middleware/auth';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_KEY_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * ==========================================
 * 1. REFRESH TOKEN ROTATION (RTR) WITH REUSE DETECTION
 * ==========================================
 */
export interface RefreshTokenRecord {
  id: string;
  token_hash: string;
  user_id: string;
  family_id: string; // Token family tracking for reuse detection
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export function createRefreshToken(userId: string, familyId?: string): { rawToken: string; record: RefreshTokenRecord } {
  const rawToken = `rt_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = hashToken(rawToken);
  const now = Date.now();
  const tokenFamily = familyId || `fam_${crypto.randomBytes(16).toString('hex')}`;

  const record: RefreshTokenRecord = {
    id: `rtrec_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    token_hash: tokenHash,
    user_id: userId,
    family_id: tokenFamily,
    is_used: false,
    expires_at: new Date(now + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
    created_at: new Date(now).toISOString(),
  };

  memoryStore.refresh_tokens.unshift(record);

  // Keep list bounded
  if (memoryStore.refresh_tokens.length > 500) {
    memoryStore.refresh_tokens.pop();
  }

  return { rawToken, record };
}

/**
 * Rotate Refresh Token:
 * Issues fresh token and invalidates old token.
 * Detects token reuse: if old token is used again, immediately revokes the entire token family!
 */
export function rotateRefreshToken(rawToken: string): {
  success: boolean;
  userId?: string;
  newRefreshToken?: string;
  error?: string;
  code?: string;
} {
  if (!rawToken || typeof rawToken !== 'string') {
    return { success: false, error: 'Refresh token is required', code: 'REFRESH_TOKEN_REQUIRED' };
  }

  const tokenHash = hashToken(rawToken);
  const record = memoryStore.refresh_tokens.find(r => r.token_hash === tokenHash);

  if (!record) {
    return { success: false, error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' };
  }

  const now = Date.now();
  if (now > new Date(record.expires_at).getTime()) {
    return { success: false, error: 'Refresh token has expired', code: 'REFRESH_TOKEN_EXPIRED' };
  }

  // REUSE DETECTION ATTACK DEFENSE
  if (record.is_used) {
    // Invalidate entire family immediately
    memoryStore.refresh_tokens.forEach(r => {
      if (r.family_id === record.family_id) {
        r.is_used = true;
        r.expires_at = new Date(0).toISOString(); // invalidate
      }
    });

    logAuditAction(record.user_id, 'security', 'REFRESH_TOKEN_REUSE_ATTACK_DETECTED', 'refresh_tokens', record.family_id);
    console.warn(`🚨 [SECURITY ALERT] Refresh token reuse detected for family ${record.family_id}. All family tokens invalidated!`);

    return {
      success: false,
      error: 'Token reuse detected. Session terminated for security reasons. Please login again.',
      code: 'TOKEN_REUSE_DETECTED',
    };
  }

  // Invalidate old token
  record.is_used = true;

  // Issue new token in same family
  const { rawToken: newRefreshToken } = createRefreshToken(record.user_id, record.family_id);

  return {
    success: true,
    userId: record.user_id,
    newRefreshToken,
  };
}

/**
 * Revoke entire token family on logout
 */
export function revokeRefreshTokenFamily(userId: string): void {
  memoryStore.refresh_tokens.forEach(r => {
    if (r.user_id === userId) {
      r.is_used = true;
      r.expires_at = new Date(0).toISOString();
    }
  });
}

/**
 * ==========================================
 * 2. API KEY ROTATION & OVERLAP GRACE PERIOD
 * ==========================================
 */
export interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  role: string;
  created_at: string;
  expires_at: string;
  grace_until?: string | null;
  is_revoked: boolean;
}

export function generateApiKey(name: string, role: string = 'officer', expiryDays: number = 90): { rawKey: string; keyRecord: ApiKeyRecord } {
  const secretPart = crypto.randomBytes(24).toString('hex');
  const rawKey = `ks_${role}_${secretPart}`;
  const keyPrefix = rawKey.substring(0, 10);
  const keyHash = hashToken(rawKey);
  const now = Date.now();

  const keyRecord: ApiKeyRecord = {
    id: `key_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    name,
    key_prefix: `${keyPrefix}...`,
    key_hash: keyHash,
    role,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
    grace_until: null,
    is_revoked: false,
  };

  memoryStore.api_keys.unshift(keyRecord);

  return { rawKey, keyRecord };
}

/**
 * Rotate an existing API Key with a seamless 24-hour grace overlap
 */
export function rotateApiKey(keyId: string, gracePeriodHours: number = 24): { success: boolean; newRawKey?: string; newKeyRecord?: ApiKeyRecord; error?: string } {
  const existingKey = memoryStore.api_keys.find(k => k.id === keyId && !k.is_revoked);
  if (!existingKey) {
    return { success: false, error: 'Active API key not found' };
  }

  // Put old key into grace period
  existingKey.grace_until = new Date(Date.now() + gracePeriodHours * 60 * 60 * 1000).toISOString();

  // Generate new key replacing it
  const { rawKey: newRawKey, keyRecord: newKeyRecord } = generateApiKey(`${existingKey.name} (Rotated)`, existingKey.role);

  logAuditAction(undefined, 'admin', 'API_KEY_ROTATED', 'api_keys', keyId, existingKey, newKeyRecord);

  return {
    success: true,
    newRawKey,
    newKeyRecord,
  };
}

/**
 * Validate an incoming API key (supports active keys & grace-period keys)
 */
export function validateApiKey(rawKey: string, requiredRole?: string): { isValid: boolean; role?: string; isGracePeriod?: boolean } {
  if (!rawKey || typeof rawKey !== 'string') return { isValid: false };

  const keyHash = hashToken(rawKey);
  const now = Date.now();

  const keyRecord = memoryStore.api_keys.find(k => k.key_hash === keyHash && !k.is_revoked);
  if (!keyRecord) return { isValid: false };

  if (requiredRole && keyRecord.role !== requiredRole && keyRecord.role !== 'admin') {
    return { isValid: false };
  }

  // Check expiration
  const isExpired = now > new Date(keyRecord.expires_at).getTime();
  const isInGrace = Boolean(keyRecord.grace_until && now < new Date(keyRecord.grace_until).getTime());

  if (isExpired && !isInGrace) {
    return { isValid: false };
  }

  return {
    isValid: true,
    role: keyRecord.role,
    isGracePeriod: isInGrace,
  };
}

/**
 * List masked API keys for administration
 */
export function listApiKeys(): any[] {
  const now = Date.now();
  return memoryStore.api_keys.map(k => {
    let status = 'ACTIVE';
    if (k.is_revoked) status = 'REVOKED';
    else if (k.grace_until && now < new Date(k.grace_until).getTime()) status = 'GRACE_PERIOD';
    else if (now > new Date(k.expires_at).getTime()) status = 'EXPIRED';

    return {
      id: k.id,
      name: k.name,
      key_prefix: k.key_prefix,
      role: k.role,
      status,
      created_at: k.created_at,
      expires_at: k.expires_at,
      grace_until: k.grace_until,
    };
  });
}
