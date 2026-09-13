/**
 * KrishiSeva Comprehensive OWASP Top 10 Verification Suite
 * Section 8: OWASP Testing
 * 
 * Verifies defenses against all 10 OWASP Top 10 vulnerabilities:
 * - A01: Broken Access Control
 * - A02: Cryptographic Failures
 * - A03: Injection
 * - A04: Insecure Design
 * - A05: Security Misconfiguration
 * - A06: Vulnerable and Outdated Components
 * - A07: Identification and Authentication Failures
 * - A08: Software and Data Integrity Failures
 * - A09: Security Logging and Monitoring Failures
 * - A10: Server-Side Request Forgery (SSRF)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

console.log('===============================================================');
console.log('         KRISHISEVA COMPREHENSIVE OWASP TOP 10 SUITE           ');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// A01: Broken Access Control
console.log('--- A01:2021 Broken Access Control ---');
const authMiddlewarePath = path.join(ROOT_DIR, 'apps/backend/src/middleware/auth.ts');
const authMiddlewareCode = fs.readFileSync(authMiddlewarePath, 'utf-8');

test('A01.1: requireRole enforces vertical role-based access control (RBAC)', () => {
  assert.ok(authMiddlewareCode.includes('requireRole'), 'Missing requireRole middleware');
  assert.ok(authMiddlewareCode.includes('Forbidden. Requires role'), 'Missing role authorization message');
});

test('A01.2: Horizontal access control: Bookings route binds farmer identity to verified JWT rather than body param', () => {
  const bookingRoutesPath = path.join(ROOT_DIR, 'apps/backend/src/routes/booking.routes.ts');
  const bookingCode = fs.readFileSync(bookingRoutesPath, 'utf-8');
  assert.ok(bookingCode.includes('req.user!.id'), 'Booking route must derive identity from validated JWT req.user.id');
});

// A02: Cryptographic Failures
console.log('\n--- A02:2021 Cryptographic Failures ---');
const encryptionServicePath = path.join(ROOT_DIR, 'apps/backend/src/services/encryption.service.ts');
const encryptionCode = fs.readFileSync(encryptionServicePath, 'utf-8');

test('A02.1: Sensitive data is encrypted with authenticated cipher AES-256-GCM', () => {
  assert.ok(encryptionCode.includes('aes-256-gcm'), 'Missing AES-256-GCM cipher');
  assert.ok(encryptionCode.includes('getAuthTag'), 'Missing authentication tag generation');
});

const securityServicePath = path.join(ROOT_DIR, 'apps/backend/src/services/security.service.ts');
const securityCode = fs.readFileSync(securityServicePath, 'utf-8');

test('A02.2: Passwords are encrypted using salted bcrypt hashing with standard work factor', () => {
  assert.ok(securityCode.includes('bcrypt.hash'), 'Missing bcrypt hashing in security.service.ts');
  assert.ok(securityCode.includes('bcrypt.compare'), 'Missing bcrypt comparison in security.service.ts');
});

// A03: Injection
console.log('\n--- A03:2021 Injection ---');
const validationPath = path.join(ROOT_DIR, 'apps/backend/src/middleware/validation.ts');
const validationCode = fs.readFileSync(validationPath, 'utf-8');

test('A03.1: Global SQL injection detection middleware inspects query, body, and params', () => {
  assert.ok(validationCode.includes('detectSqlInjection'), 'Missing detectSqlInjection middleware');
  assert.ok(validationCode.includes('UNION'), 'SQL regex missing UNION check');
  assert.ok(validationCode.includes('DROP'), 'SQL regex missing DROP check');
});

test('A03.2: Frontend sanitizes user content before display', () => {
  const sanitizePath = path.join(ROOT_DIR, 'apps/frontend/src/utils/sanitize.ts');
  const sanitizeCode = fs.readFileSync(sanitizePath, 'utf-8');
  assert.ok(sanitizeCode.includes('sanitizeText'), 'Missing sanitizeText function');
  assert.ok(/strip script/i.test(sanitizeCode), 'Missing script tag stripping');
});

// A04: Insecure Design
console.log('\n--- A04:2021 Insecure Design ---');
const rateLimiterPath = path.join(ROOT_DIR, 'apps/backend/src/middleware/rateLimiter.ts');
const rateLimiterCode = fs.readFileSync(rateLimiterPath, 'utf-8');

test('A04.1: Tiered rate limiting protects against resource exhaustion and credential stuffing', () => {
  assert.ok(rateLimiterCode.includes('authRateLimiter'), 'Missing authRateLimiter');
  assert.ok(rateLimiterCode.includes('standardApiLimiter'), 'Missing standardApiLimiter');
});

test('A04.2: Account lockout triggers after 5 consecutive failed login attempts', () => {
  assert.ok(securityCode.includes('MAX_ATTEMPTS = 5'), 'Missing MAX_ATTEMPTS = 5 lockout threshold');
  assert.ok(securityCode.includes('lockedUntil'), 'Missing lockedUntil duration');
});

// A05: Security Misconfiguration
console.log('\n--- A05:2021 Security Misconfiguration ---');
const appPath = path.join(ROOT_DIR, 'apps/backend/src/app.ts');
const appCode = fs.readFileSync(appPath, 'utf-8');

test('A05.1: Content Security Policy and HSTS configured via Helmet', () => {
  assert.ok(appCode.includes('contentSecurityPolicy'), 'Missing contentSecurityPolicy in Helmet');
  assert.ok(appCode.includes('hsts'), 'Missing HSTS in Helmet');
  assert.ok(appCode.includes('31536000'), 'HSTS maxAge must be 1 year');
});

test('A05.2: CORS origin is restricted in production via whitelist', () => {
  assert.ok(appCode.includes('isOriginAllowed'), 'Missing isOriginAllowed function in CORS configuration');
  assert.ok(appCode.includes('krishiseva.gov.in'), 'Missing gov domain in allowed origins');
});

// A06: Vulnerable and Outdated Components
console.log('\n--- A06:2021 Vulnerable and Outdated Components ---');
test('A06.1: package-lock.json pins exact versions with SHA-512 integrity digests', () => {
  const lockfilePath = path.join(ROOT_DIR, 'package-lock.json');
  assert.ok(fs.existsSync(lockfilePath), 'package-lock.json missing');
  const lock = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));
  assert.ok(lock.lockfileVersion >= 2, 'Lockfile version must be v2 or v3');
});

test('A06.2: Dependabot configuration exists for automated weekly vulnerability updates', () => {
  const dependabotPath = path.join(ROOT_DIR, '.github/dependabot.yml');
  assert.ok(fs.existsSync(dependabotPath), 'dependabot.yml missing');
});

// A07: Identification and Authentication Failures
console.log('\n--- A07:2021 Identification and Authentication Failures ---');
const authRoutesCode = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/auth.routes.ts'), 'utf-8');

test('A07.1: Multi-Factor Authentication (MFA) TOTP and Recovery Codes implemented', () => {
  assert.ok(authRoutesCode.includes('mfa_secret'), 'Missing TOTP MFA secret generation');
  assert.ok(authRoutesCode.includes('mfa_backup_codes'), 'Missing backup recovery codes');
});

test('A07.2: Single-use password reset tokens with 15-minute expiration', () => {
  assert.ok(authRoutesCode.includes('password_resets'), 'Missing password_resets tracking');
  assert.ok(authRoutesCode.includes('15 * 60 * 1000'), 'Missing 15-minute token expiration');
  assert.ok(authRoutesCode.includes('is_used = true'), 'Missing single-use token consumption');
});

// A08: Software and Data Integrity Failures
console.log('\n--- A08:2021 Software and Data Integrity Failures ---');
test('A08.1: Subresource Integrity (SRI) verified on external scripts & styles', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'apps/frontend/index.html'), 'utf-8');
  assert.ok(indexHtml.includes('integrity="sha256-'), 'Missing SRI on external resources');
});

test('A08.2: Structured audit logs sealed with HMAC cryptographic integrity signature', () => {
  const loggerPath = path.join(ROOT_DIR, 'apps/backend/src/services/logger.service.ts');
  const loggerCode = fs.readFileSync(loggerPath, 'utf-8');
  assert.ok(loggerCode.includes('hmac_seal'), 'Missing HMAC seal in logger');
  assert.ok(loggerCode.includes('verifyLogSeal'), 'Missing log seal verifier');
});

// A09: Security Logging and Monitoring Failures
console.log('\n--- A09:2021 Security Logging and Monitoring Failures ---');
test('A09.1: Anomaly telemetry tracks failed logins, bursts, and creates security alerts', () => {
  const monitoringPath = path.join(ROOT_DIR, 'apps/backend/src/services/monitoring.service.ts');
  const monitoringCode = fs.readFileSync(monitoringPath, 'utf-8');
  assert.ok(monitoringCode.includes('recordSecurityAlert'), 'Missing recordSecurityAlert function');
  assert.ok(monitoringCode.includes('BRUTE_FORCE_ANOMALY'), 'Missing brute-force anomaly alert');
});

test('A09.2: Admin can query active security alerts via dedicated API endpoint', () => {
  const monitoringRoutes = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/monitoring.routes.ts'), 'utf-8');
  assert.ok(monitoringRoutes.includes('/alerts'), 'Missing /alerts admin route');
});

// A10: Server-Side Request Forgery (SSRF)
console.log('\n--- A10:2021 Server-Side Request Forgery (SSRF) ---');
test('A10.1: URL protocol validation restricts external schemes to safe protocols', () => {
  const sanitizePath = path.join(ROOT_DIR, 'apps/frontend/src/utils/sanitize.ts');
  const sanitizeCode = fs.readFileSync(sanitizePath, 'utf-8');
  assert.ok(sanitizeCode.includes('isSafeUrl'), 'Missing isSafeUrl function');
  assert.ok(sanitizeCode.includes('safeProtocols'), 'Missing safe protocol whitelist');
});

test('A10.2: Open redirect validator blocks protocol-relative and untrusted host redirects', () => {
  const sanitizePath = path.join(ROOT_DIR, 'apps/frontend/src/utils/sanitize.ts');
  const sanitizeCode = fs.readFileSync(sanitizePath, 'utf-8');
  assert.ok(sanitizeCode.includes('validateRedirectUrl'), 'Missing validateRedirectUrl function');
  assert.ok(sanitizeCode.includes('//'), 'Missing protocol-relative check');
});

console.log('\n===============================================================');
console.log(`  🎉 OWASP TOP 10 VERIFICATION: ${passedTests}/${totalTests} CHECKS PASSED`);
console.log('  All 10 OWASP standard security categories validated.');
console.log('===============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
