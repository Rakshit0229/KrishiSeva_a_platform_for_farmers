import { memoryStore } from '../db';
import { logAuditAction } from '../middleware/auth';

export interface RetentionReport {
  timestamp: string;
  purgedSessions: number;
  purgedPasswordResets: number;
  purgedSensitiveTokens: number;
  purgedWeatherCache: number;
  prunedAuditLogs: number;
  anonymizedUsers: number;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 4. Data Retention Policies & Automatic Lifecycle Purge
 * Enforces strict data life-cycle policies and removes expired / obsolete data
 */
export function runDataRetentionCleanup(): RetentionReport {
  const now = Date.now();
  let purgedSessions = 0;
  let purgedPasswordResets = 0;
  let purgedSensitiveTokens = 0;
  let purgedWeatherCache = 0;
  let prunedAuditLogs = 0;
  let anonymizedUsers = 0;

  // 1. Purge expired sessions (or revoked sessions older than 24h)
  const initialSessionCount = memoryStore.active_sessions.length;
  memoryStore.active_sessions = memoryStore.active_sessions.filter((s) => {
    const expired = new Date(s.expires_at).getTime() < now;
    const oldRevoked = s.is_revoked && (now - new Date(s.created_at).getTime() > ONE_DAY_MS);
    return !expired && !oldRevoked;
  });
  purgedSessions = initialSessionCount - memoryStore.active_sessions.length;

  // 2. Purge expired or consumed password reset tokens
  const initialResetCount = memoryStore.password_resets.length;
  memoryStore.password_resets = memoryStore.password_resets.filter((r) => {
    const expired = new Date(r.expires_at).getTime() < now;
    return !expired && !r.is_used;
  });
  purgedPasswordResets = initialResetCount - memoryStore.password_resets.length;

  // 3. Purge expired or used sensitive action tokens (5-minute max life)
  const initialSensitiveCount = memoryStore.sensitive_action_tokens.length;
  memoryStore.sensitive_action_tokens = memoryStore.sensitive_action_tokens.filter((t) => {
    const expired = new Date(t.expires_at).getTime() < now;
    return !expired && !t.is_used;
  });
  purgedSensitiveTokens = initialSensitiveCount - memoryStore.sensitive_action_tokens.length;

  // 4. Purge expired weather cache records (> 24 hours)
  const initialWeatherCount = memoryStore.weather_cache.length;
  memoryStore.weather_cache = memoryStore.weather_cache.filter((w) => {
    const createdAt = w.created_at ? new Date(w.created_at).getTime() : now;
    return now - createdAt < ONE_DAY_MS;
  });
  purgedWeatherCache = initialWeatherCount - memoryStore.weather_cache.length;

  // 5. Prune audit logs older than 90 days (Compliance archiving)
  const initialAuditCount = memoryStore.audit_logs.length;
  memoryStore.audit_logs = memoryStore.audit_logs.filter((log) => {
    const createdAt = new Date(log.created_at).getTime();
    return now - createdAt < NINETY_DAYS_MS;
  });
  prunedAuditLogs = initialAuditCount - memoryStore.audit_logs.length;

  // 6. Anonymize deactivated user accounts (> 30 days) under Right to Erasure
  memoryStore.users.forEach((user) => {
    if (!user.is_active && user.deactivated_at) {
      const deactTime = new Date(user.deactivated_at).getTime();
      if (now - deactTime > THIRTY_DAYS_MS && !user.is_anonymized) {
        user.name = 'Anonymized Farmer';
        user.phone = '+910000000000';
        user.email = null;
        user.password_hash = null;
        user.is_anonymized = true;
        anonymizedUsers++;
      }
    }
  });

  const report: RetentionReport = {
    timestamp: new Date().toISOString(),
    purgedSessions,
    purgedPasswordResets,
    purgedSensitiveTokens,
    purgedWeatherCache,
    prunedAuditLogs,
    anonymizedUsers,
  };

  logAuditAction(undefined, 'system', 'DATA_RETENTION_CYCLE_EXECUTED', 'system', 'cleanup', null, report);
  console.log('🧹 [RETENTION ENGINE] Data lifecycle purge cycle completed:', report);

  return report;
}

let retentionInterval: NodeJS.Timeout | null = null;

export function initDataRetentionSchedule(intervalMs: number = 60 * 60 * 1000): void {
  if (retentionInterval) clearInterval(retentionInterval);
  // Run once on startup
  runDataRetentionCleanup();
  // Schedule recurring hourly
  retentionInterval = setInterval(runDataRetentionCleanup, intervalMs);
}

export const runDataRetentionPurge = runDataRetentionCleanup;

