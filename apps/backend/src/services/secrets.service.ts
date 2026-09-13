/**
 * 5. Secure API Keys & Credentials Protection
 * Sanitizes credentials from logs and validates environment variables on startup
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /pass/i,
  /secret/i,
  /token/i,
  /auth/i,
  /apikey/i,
  /api_key/i,
  /credential/i,
  /cookie/i,
  /hash/i,
  /private/i,
];

/**
 * Deep redaction of sensitive credentials from objects before logging
 */
export function redactSensitiveCredentials(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    let sanitized = data.replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi, '$1*****$3');
    sanitized = sanitized.replace(/(password|secret|token|api_?key|auth|aadhaar|bank_account)\s*[:=]\s*["']?([^"'\s&]+)["']?/gi, '$1="[REDACTED_CREDENTIAL]"');
    sanitized = sanitized.replace(/(Bearer\s+)[A-Za-z0-9-_=.]+/gi, '$1[REDACTED_CREDENTIAL]');
    return sanitized;
  }
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveCredentials);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitiveKey && typeof value === 'string') {
      sanitized[key] = '[REDACTED_CREDENTIAL]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveCredentials(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validates cryptographic secret strengths on startup
 */
export function validateEnvironmentSecrets(): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.includes('change_in_production') || jwtSecret.length < 16) {
    warnings.push('JWT_SECRET is weak or using a default test value. Set a cryptographically random secret in production.');
  }

  const encKey = process.env.DATA_ENCRYPTION_KEY;
  if (!encKey) {
    warnings.push('DATA_ENCRYPTION_KEY not set; using application salt fallback. Set a dedicated 32-byte secret in production.');
  }

  if (isProd && warnings.length > 0) {
    console.warn('⚠️ [SECURITY AUDIT] Environment Secret Warnings:\n' + warnings.join('\n'));
  }

  return { isValid: warnings.length === 0, warnings };
}
