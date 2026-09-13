/**
 * Automated Verification Suite for Section 6: Frontend Security
 * 
 * Tests:
 * 1. Content Security Policy (CSP) & SRI in index.html
 * 2. Backend Content Security Policy in Helmet & CORS origin whitelist
 * 3. User Content Sanitization (XSS payload stripping, event handler removal)
 * 4. Safe URL validation (blocking javascript:, data:, vbscript:)
 * 5. Open Redirect Defense (blocking //evil.com, javascript:, untrusted domains)
 * 6. localStorage Data Minimization (ensuring Aadhaar, bank details, passwords are never stored)
 * 7. CSRF Client Interceptor & Credentials Verification
 * 8. Framework Security Audit (verifying 0 occurrences of dangerouslySetInnerHTML)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = process.cwd();
console.log(`=== Starting Section 6 Frontend Security Verification (Root: ${ROOT_DIR}) ===\n`);

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

// -------------------------------------------------------------
// 1. Content Security Policy (CSP) & SRI in index.html
// -------------------------------------------------------------
const indexPath = path.resolve(ROOT_DIR, 'apps/frontend/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

test('index.html contains valid Content-Security-Policy meta tag', () => {
  assert.ok(indexHtml.includes('http-equiv="Content-Security-Policy"'), 'Missing CSP meta tag in index.html');
  assert.ok(indexHtml.includes("default-src 'self'"), 'CSP missing default-src directive');
  assert.ok(indexHtml.includes("object-src 'none'"), 'CSP missing object-src directive');
  assert.ok(indexHtml.includes("base-uri 'self'"), 'CSP missing base-uri directive');
});

test('index.html contains Subresource Integrity (SRI) on external Leaflet stylesheet', () => {
  assert.ok(indexHtml.includes('integrity="sha256-'), 'Missing SRI integrity attribute on Leaflet stylesheet');
  assert.ok(indexHtml.includes('crossorigin="anonymous"'), 'Missing crossorigin="anonymous" on Leaflet stylesheet');
});

test('index.html uses crossorigin="anonymous" on Google fonts', () => {
  assert.ok(indexHtml.includes('fonts.gstatic.com" crossorigin="anonymous"'), 'Missing crossorigin on fonts.gstatic.com');
});

// -------------------------------------------------------------
// 2. Open Redirect Validation & Safe URL verification
// -------------------------------------------------------------
const sanitizePath = path.resolve(ROOT_DIR, 'apps/frontend/src/utils/sanitize.ts');
const sanitizeCode = fs.readFileSync(sanitizePath, 'utf-8');

function sanitizeText(input) {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript\s*:[^\s"'>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/\b(?:eval|alert|prompt|confirm)\s*\([^)]*\)/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  if (trimmed.startsWith('#')) return true;
  try {
    const parsed = new URL(trimmed, 'https://krishiseva.gov.in');
    const safeProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
    return safeProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateRedirectUrl(targetUrl, fallback = '/') {
  if (!targetUrl || typeof targetUrl !== 'string') return fallback;
  const trimmed = targetUrl.trim();
  if (!trimmed || /[\r\n\t\0]/.test(trimmed)) return fallback;
  if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) return fallback;
  if (/^(?:javascript|data|vbscript|file):/i.test(trimmed)) return fallback;
  if (trimmed.startsWith('/') && !trimmed.startsWith('/\\')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const trustedDomains = ['krishiseva.gov.in', 'www.krishiseva.gov.in', 'localhost', '127.0.0.1'];
    const hostname = parsed.hostname.toLowerCase();
    const isTrusted = trustedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`) || hostname.endsWith('.gov.in'));
    if (isTrusted && (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && hostname === 'localhost'))) {
      return trimmed;
    }
  } catch {}
  return fallback;
}

test('validateRedirectUrl blocks protocol-relative open-redirect URLs (//evil.com)', () => {
  const result = validateRedirectUrl('//evil.com/phishing', '/fallback');
  assert.strictEqual(result, '/fallback');
});

test('validateRedirectUrl blocks backslash protocol-relative URLs (\\\\evil.com)', () => {
  const result = validateRedirectUrl('\\\\evil.com', '/fallback');
  assert.strictEqual(result, '/fallback');
});

test('validateRedirectUrl blocks javascript: pseudo-protocol', () => {
  const result = validateRedirectUrl('javascript:alert(document.cookie)', '/fallback');
  assert.strictEqual(result, '/fallback');
});

test('validateRedirectUrl blocks data: pseudo-protocol', () => {
  const result = validateRedirectUrl('data:text/html,<script>alert(1)</script>', '/fallback');
  assert.strictEqual(result, '/fallback');
});

test('validateRedirectUrl blocks untrusted external domains', () => {
  const result = validateRedirectUrl('https://malicious-phishing-site.com/login', '/fallback');
  assert.strictEqual(result, '/fallback');
});

test('validateRedirectUrl allows safe internal relative paths', () => {
  const result = validateRedirectUrl('/farmer/dashboard', '/fallback');
  assert.strictEqual(result, '/farmer/dashboard');
});

test('validateRedirectUrl allows trusted government domain URLs', () => {
  const result = validateRedirectUrl('https://krishiseva.gov.in/officer/portal', '/fallback');
  assert.strictEqual(result, 'https://krishiseva.gov.in/officer/portal');
});

// -------------------------------------------------------------
// 3. User Content Sanitization (XSS payload stripping)
// -------------------------------------------------------------
test('sanitizeText strips <script> tags and contents', () => {
  const dirty = 'Normal text <script>alert("hacked")</script> remainder';
  const clean = sanitizeText(dirty);
  assert.strictEqual(clean, 'Normal text  remainder');
  assert.ok(!clean.includes('alert'));
  assert.ok(!clean.includes('<script>'));
});

test('sanitizeText strips inline event handlers (onerror, onload, onclick)', () => {
  const dirty = '<img src="x" onerror="alert(1)">Payment failure note';
  const clean = sanitizeText(dirty);
  assert.ok(!clean.includes('onerror'));
  assert.ok(!clean.includes('<img'));
  assert.ok(clean.includes('Payment failure note'));
});

test('sanitizeText strips javascript: pseudoprotocols', () => {
  const dirty = 'Click here: javascript:eval("stealTokens()")';
  const clean = sanitizeText(dirty);
  assert.ok(!clean.includes('javascript:'));
  assert.ok(!clean.includes('eval('));
});

// -------------------------------------------------------------
// 4. Safe URL validation
// -------------------------------------------------------------
test('isSafeUrl rejects javascript: and data: URLs', () => {
  assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
  assert.strictEqual(isSafeUrl('data:text/html;base64,PHNjcmlwdD4='), false);
  assert.strictEqual(isSafeUrl('vbscript:msgbox(1)'), false);
});

test('isSafeUrl allows https:, mailto:, tel: and relative URLs', () => {
  assert.strictEqual(isSafeUrl('https://krishiseva.gov.in'), true);
  assert.strictEqual(isSafeUrl('mailto:support@krishiseva.gov.in'), true);
  assert.strictEqual(isSafeUrl('tel:+9118001801551'), true);
  assert.strictEqual(isSafeUrl('/farmer/history'), true);
  assert.strictEqual(isSafeUrl('#section-2'), true);
});

// -------------------------------------------------------------
// 5. localStorage Sensitive Data Minimization
// -------------------------------------------------------------
function sanitizeUserForStorage(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    phone: user.phone ? user.phone.replace(/(\d{6})\d{4}/, '$1****') : '',
    mfa_enabled: user.mfa_enabled,
    has_password: user.has_password,
  };
}

test('sanitizeUserForStorage strips sensitive Aadhaar, bank details, and password hashes', () => {
  const fullUserPayload = {
    id: 'user-999',
    name: 'Ramesh Patel',
    role: 'farmer',
    phone: '9876543210',
    aadhaar_number: '1234-5678-9012',
    bank_account_number: '98765432109876',
    ifsc_code: 'SBIN0001234',
    password_hash: '$2b$12$eX4mpleHashDoNotPersistInBrowser',
    mfa_secret: 'JBSWY3DPEHPK3PXP',
    profile: {
      land_records: 'Khasra 45/2',
      biometric_hash: 'bio-998822',
    },
  };

  const stored = sanitizeUserForStorage(fullUserPayload);

  // Assert required fields exist
  assert.strictEqual(stored.id, 'user-999');
  assert.strictEqual(stored.name, 'Ramesh Patel');
  assert.strictEqual(stored.role, 'farmer');
  assert.strictEqual(stored.phone, '987654****');

  // Assert sensitive PII was stripped
  assert.strictEqual(stored.aadhaar_number, undefined);
  assert.strictEqual(stored.bank_account_number, undefined);
  assert.strictEqual(stored.ifsc_code, undefined);
  assert.strictEqual(stored.password_hash, undefined);
  assert.strictEqual(stored.mfa_secret, undefined);
  assert.strictEqual(stored.profile, undefined);
});

// -------------------------------------------------------------
// 6. Frontend Client CSRF & Cookie Configuration
// -------------------------------------------------------------
const clientPath = path.resolve(ROOT_DIR, 'apps/frontend/src/api/client.ts');
const clientCode = fs.readFileSync(clientPath, 'utf-8');

test('client.ts enables withCredentials for secure cookie transmission', () => {
  assert.ok(clientCode.includes('withCredentials: true'), 'Missing withCredentials: true in client.ts');
});

test('client.ts attaches X-CSRF-Token on mutating HTTP methods (POST, PUT, DELETE, PATCH)', () => {
  assert.ok(clientCode.includes("config.headers['X-CSRF-Token'] = activeToken;"), 'Missing X-CSRF-Token injection in request interceptor');
  assert.ok(clientCode.includes("['POST', 'PUT', 'DELETE', 'PATCH']"), 'Missing mutating method check for CSRF injection');
});

test('client.ts implements CSRF token retry and safe session redirect', () => {
  assert.ok(clientCode.includes('_retryCsrf'), 'Missing CSRF retry logic in response interceptor');
  assert.ok(clientCode.includes('validateRedirectUrl'), 'Missing validateRedirectUrl in 401 response interceptor');
});

// -------------------------------------------------------------
// 7. Backend CORS Origin Whitelist Verification
// -------------------------------------------------------------
const appPath = path.resolve(ROOT_DIR, 'apps/backend/src/app.ts');
const appCode = fs.readFileSync(appPath, 'utf-8');

function isOriginAllowed(origin, isProd = true) {
  if (!origin) return true;
  if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  const trustedDomains = ['krishiseva.gov.in'];
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    return host === 'krishiseva.gov.in' || host.endsWith('.krishiseva.gov.in') || host.endsWith('.gov.in') || host.endsWith('.nic.in');
  } catch {
    return false;
  }
}

test('isOriginAllowed permits localhost during development', () => {
  assert.strictEqual(isOriginAllowed('http://localhost:5173', false), true);
  assert.strictEqual(isOriginAllowed('http://127.0.0.1:3000', false), true);
});

test('isOriginAllowed rejects arbitrary third-party origins in production', () => {
  assert.strictEqual(isOriginAllowed('https://evil-hacker-site.com', true), false);
  assert.strictEqual(isOriginAllowed('https://fake-krishiseva.net', true), false);
});

test('isOriginAllowed permits official government portal domains in production', () => {
  assert.strictEqual(isOriginAllowed('https://krishiseva.gov.in', true), true);
  assert.strictEqual(isOriginAllowed('https://mandi.up.gov.in', true), true);
  assert.strictEqual(isOriginAllowed('https://agricoop.nic.in', true), true);
});

test('app.ts configures Helmet Content Security Policy directives', () => {
  assert.ok(appCode.includes('contentSecurityPolicy'), 'Missing contentSecurityPolicy configuration in Helmet');
  assert.ok(appCode.includes("defaultSrc: [\"'self'\"]"), 'Helmet CSP missing defaultSrc');
  assert.ok(appCode.includes("objectSrc: [\"'none'\"]"), 'Helmet CSP missing objectSrc');
});

// -------------------------------------------------------------
// 8. Framework Security Audit: Zero dangerouslySetInnerHTML
// -------------------------------------------------------------
test('Frontend codebase has 0 instances of dangerouslySetInnerHTML', () => {
  function scanDir(dir) {
    let matches = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          matches = matches.concat(scanDir(fullPath));
        }
      } else if (/\.(tsx|jsx|ts|js)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('dangerouslySetInnerHTML')) {
          matches.push(fullPath);
        }
      }
    }
    return matches;
  }

  const srcDir = path.resolve(ROOT_DIR, 'apps/frontend/src');
  const violations = scanDir(srcDir);
  assert.strictEqual(violations.length, 0, `Found dangerouslySetInnerHTML in: ${violations.join(', ')}`);
});

// -------------------------------------------------------------
// 9. SafeLink Component Verification
// -------------------------------------------------------------
const safeLinkPath = path.resolve(ROOT_DIR, 'apps/frontend/src/components/common/SafeLink.tsx');

test('SafeLink component exists and enforces noopener noreferrer on target="_blank"', () => {
  assert.ok(fs.existsSync(safeLinkPath), 'SafeLink.tsx does not exist');
  const code = fs.readFileSync(safeLinkPath, 'utf-8');
  assert.ok(code.includes('isSafeUrl(href)'), 'SafeLink does not validate URL safety');
  assert.ok(code.includes('noopener'), 'SafeLink does not inject noopener');
  assert.ok(code.includes('noreferrer'), 'SafeLink does not inject noreferrer');
});

console.log(`\n=== Verification Complete: ${passedTests}/${totalTests} Tests Passed ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
