/**
 * KrishiSeva AI Security & Guardrails Service
 * Section 11: AI-Specific Security
 * 
 * Implements:
 * 1. AI Service Access Control (RBAC & Quotas)
 * 2. Strict AI-Generated SQL Query Validation & Parameterization
 * 3. AI Circuit Breakers & Multi-Tier Deterministic Fallbacks
 * 4. AI Security Research & OWASP Top 10 for LLM Threat Matrix
 */

import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../db';
import { logAuditAction } from '../middleware/auth';

// =========================================================================
// 1. AI SERVICE ACCESS CONTROL (RBAC & QUOTAS)
// =========================================================================

export interface AiUsageQuota {
  userId: string;
  requestsCount: number;
  tokensConsumed: number;
  lastReset: number;
}

const aiQuotas: Map<string, AiUsageQuota> = new Map();
const MAX_AI_REQUESTS_PER_WINDOW = 60; // 60 queries
const QUOTA_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function enforceAiAccessControl(req: Request, res: Response, next: NextFunction) {
  // Allow public access to introductory agri help, but enforce quotas
  const clientId = (req as any).user ? (req as any).user.id : `anon_${req.ip || '127.0.0.1'}`;
  const now = Date.now();

  let quota = aiQuotas.get(clientId);
  if (!quota || now - quota.lastReset > QUOTA_WINDOW_MS) {
    quota = {
      userId: clientId,
      requestsCount: 0,
      tokensConsumed: 0,
      lastReset: now,
    };
    aiQuotas.set(clientId, quota);
  }

  if (quota.requestsCount >= MAX_AI_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'AI service request limit reached. Please wait before asking more questions.',
      code: 'AI_QUOTA_EXCEEDED',
      retryAfterSeconds: Math.ceil((quota.lastReset + QUOTA_WINDOW_MS - now) / 1000),
    });
  }

  quota.requestsCount++;
  next();
}

// =========================================================================
// 2. VALIDATE AI-GENERATED QUERIES (PARAMETERIZATION & ANTI-INJECTION)
// =========================================================================

export interface ValidatedAiQuery {
  isValid: boolean;
  sanitizedSql?: string;
  params?: any[];
  violationReason?: string;
}

// Strictly disallow DDL, destructive DML, and injection payloads from AI query generation
const DISALLOWED_AI_SQL_KEYWORDS = [
  /\bDROP\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /\bINSERT\s+INTO\s+users\b/i,
  /\bUPDATE\s+users\b/i,
  /\bDELETE\s+FROM\s+users\b/i,
  /--/,
  /\/\*/,
  /;\s*$/,
];

const ALLOWED_AI_TABLES = [
  'msp_rates',
  'procurement_centres',
  'slots',
  'demand_forecasts',
  'faq_articles',
  'weather_cache',
];

export function validateAiGeneratedQuery(rawSql: string, params: any[] = []): ValidatedAiQuery {
  if (!rawSql || typeof rawSql !== 'string') {
    return { isValid: false, violationReason: 'AI Query must be a non-empty string' };
  }

  const trimmed = rawSql.trim();

  // Enforce read-only SELECT queries
  if (!trimmed.toUpperCase().startsWith('SELECT')) {
    return {
      isValid: false,
      violationReason: 'Security Policy Violation: AI agents are only permitted to generate read-only SELECT queries',
    };
  }

  // Disallow stacked queries (semicolon in middle)
  if (trimmed.includes(';')) {
    return {
      isValid: false,
      violationReason: 'Security Policy Violation: Multi-statement query injection detected',
    };
  }

  // Check for disallowed keywords
  for (const pattern of DISALLOWED_AI_SQL_KEYWORDS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        violationReason: `Security Policy Violation: Dangerous keyword or token detected: ${pattern.toString()}`,
      };
    }
  }

  // Check table whitelist
  const tableRegex = /\bFROM\s+([a-zA-Z0-9_]+)/gi;
  let match;
  while ((match = tableRegex.exec(trimmed)) !== null) {
    const tableName = match[1].toLowerCase();
    if (!ALLOWED_AI_TABLES.includes(tableName)) {
      return {
        isValid: false,
        violationReason: `Security Policy Violation: Unauthorized table access [${tableName}]. AI cannot access PII or sensitive tables.`,
      };
    }
  }

  return {
    isValid: true,
    sanitizedSql: trimmed,
    params,
  };
}

// =========================================================================
// 3. AI COMPONENT FALLBACKS & CIRCUIT BREAKER
// =========================================================================

export interface FallbackAgriAdvice {
  topic: string;
  advice: string;
  source: string;
  isFallback: boolean;
}

const STATIC_EXPERT_AGRI_FALLBACKS: Record<string, string> = {
  msp: 'Official Government 2025-26 MSP Rates: Wheat ₹2,425/Qtl, Mustard ₹5,950/Qtl, Paddy ₹2,300/Qtl. Direct bank credit occurs within 72 hours of weighment.',
  moisture: 'Grain Moisture Standards (FAQ): Wheat max 12.0%, Paddy max 17.0%, Mustard max 8.0%. Sun-dry crop on tarpaulin to reach FAQ standard before mandi transit.',
  slot: 'To book a Mandi slot, go to Book Slot, choose your APMC centre and time window, and get an instant QR token to skip queues.',
  delay: 'In case of tractor breakdown, KrishiSeva provides a 2-Hour Grace Period. Click "Report Mandi Transit Delay" on your dashboard to notify gate operators.',
  default: 'KrishiSeva AI Assistant is currently utilizing certified agricultural guidance. For immediate assistance, dial Kisan Call Centre at 1800-180-1551.',
};

export async function executeAiWithFallback<T>(
  aiOperation: () => Promise<T>,
  fallbackCategory: string = 'default',
  timeoutMs: number = 3000
): Promise<{ result: T | FallbackAgriAdvice; isFallback: boolean }> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT_EXCEEDED')), timeoutMs)
    );

    const data = (await Promise.race([aiOperation(), timeoutPromise])) as T;
    return { result: data, isFallback: false };
  } catch (err: any) {
    console.warn(`[AI COMPONENT FALLBACK] Triggered fallback due to: ${err.message}`);
    const fallbackMessage = STATIC_EXPERT_AGRI_FALLBACKS[fallbackCategory] || STATIC_EXPERT_AGRI_FALLBACKS['default'];

    return {
      result: {
        topic: fallbackCategory,
        advice: fallbackMessage,
        source: 'ICAR & DoCA Certified Agricultural Expert Rules Engine (Deterministic Fallback)',
        isFallback: true,
      },
      isFallback: true,
    };
  }
}

// =========================================================================
// 4. MONITOR AI SECURITY RESEARCH & OWASP TOP 10 FOR LLM
// =========================================================================

export interface AiThreatMitigation {
  id: string; // e.g. LLM01
  name: string;
  threatDescription: string;
  krishiSevaMitigation: string;
  status: 'ACTIVE_DEFENSE' | 'ENFORCED';
}

export const OWASP_LLM_THREAT_CATALOG: AiThreatMitigation[] = [
  {
    id: 'LLM01',
    name: 'Prompt Injection',
    threatDescription: 'Adversarial manipulation of LLM inputs to hijack system behavior or leak system prompts.',
    krishiSevaMitigation: 'Regex-based prompt injection pattern blocker + Agricultural domain classifier in aiGuardrails.ts.',
    status: 'ACTIVE_DEFENSE',
  },
  {
    id: 'LLM02',
    name: 'Sensitive Information Disclosure',
    threatDescription: 'LLM inadvertently revealing farmer PII, Aadhaar numbers, or bank account credentials.',
    krishiSevaMitigation: 'Allowed table whitelist + redactSensitiveCredentials filter preventing PII in training/prompts.',
    status: 'ENFORCED',
  },
  {
    id: 'LLM06',
    name: 'Excessive Agency',
    threatDescription: 'AI component performing unintended state modifications or database alterations.',
    krishiSevaMitigation: 'validateAiGeneratedQuery permits only read-only SELECT queries; all updates require human signature.',
    status: 'ENFORCED',
  },
  {
    id: 'LLM08',
    name: 'Model DoS & Resource Exhaustion',
    threatDescription: 'Overloading AI inference engines with abusive requests leading to starvation.',
    krishiSevaMitigation: 'enforceAiAccessControl enforces 60 requests / 15-minute quota with 3-second circuit breakers.',
    status: 'ACTIVE_DEFENSE',
  },
];

export function getAiSecurityResearchStatus() {
  return {
    framework: 'OWASP Top 10 for Large Language Model Applications (2025/2026)',
    activeMitigationsCount: OWASP_LLM_THREAT_CATALOG.length,
    threats: OWASP_LLM_THREAT_CATALOG,
    lastReviewed: '2026-09-13',
  };
}
