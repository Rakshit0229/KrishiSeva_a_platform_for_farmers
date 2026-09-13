import crypto from 'crypto';
import { redactSensitiveCredentials } from './secrets.service';
import { memoryStore } from '../db';
import { recordSecurityAlert } from './monitoring.service';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY_INCIDENT';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  correlation_id?: string;
  message: string;
  ip?: string;
  method?: string;
  path?: string;
  metadata?: Record<string, any>;
  hmac_seal?: string;
}

const LOG_SEAL_SECRET = process.env.LOG_SEAL_SECRET || 'krishi_audit_log_hmac_secret_seal_2026';

/**
 * Generate cryptographic HMAC seal for tamper-evident audit logging
 */
export function sealLogEntry(entry: Omit<StructuredLogEntry, 'hmac_seal'>): string {
  const content = `${entry.timestamp}|${entry.level}|${entry.component}|${entry.message}`;
  return crypto.createHmac('sha256', LOG_SEAL_SECRET).update(content).digest('hex');
}

/**
 * Verify integrity of an HMAC-sealed audit log entry
 */
export function verifyLogSeal(entry: StructuredLogEntry): boolean {
  if (!entry.hmac_seal) return false;
  const expected = sealLogEntry(entry);
  return entry.hmac_seal === expected;
}

// In-memory circular buffer of structured logs (capped at 500 entries)
const structuredLogsBuffer: StructuredLogEntry[] = [];
const MAX_LOG_BUFFER = 500;

/**
 * 3. Logging & Monitoring: Structured JSON Logging
 * Emits machine-parsable JSON lines and redacts sensitive credentials
 */
export function logStructured(
  level: LogLevel,
  component: string,
  message: string,
  extra: {
    correlation_id?: string;
    ip?: string;
    method?: string;
    path?: string;
    metadata?: Record<string, any>;
  } = {}
): StructuredLogEntry {
  // Redact any sensitive credentials from message and metadata
  const cleanMessage = redactSensitiveCredentials(message);
  const cleanMetadata = extra.metadata ? redactSensitiveCredentials(extra.metadata) : undefined;

  const rawEntry: Omit<StructuredLogEntry, 'hmac_seal'> = {
    timestamp: new Date().toISOString(),
    level,
    component,
    correlation_id: extra.correlation_id,
    message: cleanMessage,
    ip: extra.ip,
    method: extra.method,
    path: extra.path,
    metadata: cleanMetadata,
  };

  const sealedEntry: StructuredLogEntry = {
    ...rawEntry,
    hmac_seal: sealLogEntry(rawEntry),
  };

  structuredLogsBuffer.unshift(sealedEntry);
  if (structuredLogsBuffer.length > MAX_LOG_BUFFER) {
    structuredLogsBuffer.pop();
  }

  // If level is SECURITY_INCIDENT, escalate to security alerts
  if (level === 'SECURITY_INCIDENT') {
    recordSecurityAlert(
      'HIGH',
      'LOGGED_SECURITY_INCIDENT',
      cleanMessage,
      {
        headers: {},
        ip: extra.ip || '127.0.0.1',
        url: extra.path || '/unknown',
        method: extra.method || 'INTERNAL',
      } as any,
      cleanMetadata
    );
  }

  // Print single-line JSON log
  const jsonOutput = JSON.stringify(sealedEntry);
  if (level === 'ERROR' || level === 'SECURITY_INCIDENT') {
    console.error(jsonOutput);
  } else if (level === 'WARN') {
    console.warn(jsonOutput);
  } else {
    console.log(jsonOutput);
  }

  return sealedEntry;
}

export function getStructuredLogs(limit: number = 100, levelFilter?: LogLevel): StructuredLogEntry[] {
  let logs = structuredLogsBuffer;
  if (levelFilter) {
    logs = logs.filter(l => l.level === levelFilter);
  }
  return logs.slice(0, limit);
}
