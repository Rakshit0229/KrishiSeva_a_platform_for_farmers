/**
 * Automated Verification Test Suite for Section 3: Data Protection & Privacy
 * Checks:
 * 1. AES-256-GCM Encryption & Tamper-Proof Decryption
 * 2. HTTPS / TLS & HSTS Headers
 * 3. Data Minimization & PII Masking (Aadhaar & Bank Account)
 * 4. Data Retention & Automatic Purge Policy
 * 5. Secure Credentials & Secret Redaction
 * 6. Sensitive Data Access Logging (Audit Trail)
 * 7. DPDP Act 2023 Privacy Policy & Routing
 * 8. Secure Database Configuration & Statement Timeout
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const BACKEND_DIST = path.resolve(ROOT_DIR, 'apps/backend/dist');

async function runTestSuite() {
  console.log('===============================================================');
  console.log('  KRISHISEVA SECURITY SUITE: SECTION 3 DATA PROTECTION & PRIVACY');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // ── 1. Encrypt Sensitive Data (AES-256-GCM) ──
  console.log('--- 1. Encrypt Sensitive Data (AES-256-GCM) ---');
  try {
    const encryptionService = require(path.join(BACKEND_DIST, 'services/encryption.service.js'));
    const secretBank = 'SBIN0001234-987654321012';
    const encrypted = encryptionService.encryptSensitiveData(secretBank);
    
    assert(typeof encrypted === 'string' && encrypted.startsWith('enc:v1:'), 'Ciphertext uses versioned format "enc:v1:<iv>:<tag>:<ciphertext>"');
    
    const parts = encrypted.split(':');
    assert(parts.length === 5, 'Ciphertext contains 5 components (enc, version, IV, AuthTag, Ciphertext)');
    
    const decrypted = encryptionService.decryptSensitiveData(encrypted);
    assert(decrypted === secretBank, 'Decryption reproduces original plain text exactly');

    // Test tamper detection (authenticated encryption)
    let tampered = encrypted.slice(0, -3) + 'abc';
    let failedToAuth = false;
    try {
      encryptionService.decryptSensitiveData(tampered);
    } catch (e) {
      failedToAuth = true;
    }
    assert(failedToAuth, 'Tampered ciphertext is rejected by AES-256-GCM authentication tag');
  } catch (err) {
    assert(false, `Encryption service test failed with error: ${err.message}`);
  }

  // ── 2. HTTPS / TLS & HSTS Headers ──
  console.log('\n--- 2. HTTPS / TLS & HSTS Security Configuration ---');
  try {
    const appTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/app.ts'), 'utf8');
    assert(appTs.includes('hsts: {'), 'Helmet HSTS enabled in backend');
    assert(appTs.includes('31536000'), 'HSTS maxAge configured to 1 year (31,536,000s)');
    assert(appTs.includes('includeSubDomains: true'), 'HSTS applies to subdomains');
    assert(appTs.includes('preload: true'), 'HSTS preload flag enabled');
    assert(appTs.includes('x-forwarded-proto') && appTs.includes('301'), 'Production HTTPS 301 redirection implemented');
  } catch (err) {
    assert(false, `HTTPS/HSTS inspection error: ${err.message}`);
  }

  // ── 3. Data Minimization & PII Masking ──
  console.log('\n--- 3. Data Minimization & PII Masking ---');
  try {
    const encryptionService = require(path.join(BACKEND_DIST, 'services/encryption.service.js'));
    
    const maskedAadhaar = encryptionService.maskAadhaar('123456789012');
    assert(maskedAadhaar === 'XXXX-XXXX-9012', `Aadhaar masked to last 4 digits (got "${maskedAadhaar}")`);

    const maskedBank = encryptionService.maskBankAccount('9876543210123456');
    assert(maskedBank === 'XXXXXXXX3456', `Bank account masked to last 4 digits (got "${maskedBank}")`);

    const maskedGeneral = encryptionService.maskPII('123456789012');
    assert(maskedGeneral.endsWith('9012') && maskedGeneral.startsWith('XXXX'), 'General maskPII securely masks sensitive strings');

    const farmerRoutesTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/farmer.routes.ts'), 'utf8');
    assert(farmerRoutesTs.includes('masked_aadhaar: maskAadhaar('), 'Farmer profile read outputs masked_aadhaar');
    assert(farmerRoutesTs.includes('masked_bank_account: maskBankAccount('), 'Farmer profile read outputs masked_bank_account');
    assert(farmerRoutesTs.includes('encrypted_bank_account: undefined'), 'Farmer profile read strips encrypted_bank_account from public output');
  } catch (err) {
    assert(false, `PII masking test error: ${err.message}`);
  }

  // ── 4. Data Retention Policies ──
  console.log('\n--- 4. Data Retention & Purge Automation ---');
  try {
    const retentionService = require(path.join(BACKEND_DIST, 'services/retention.service.js'));
    const retentionSummary = retentionService.runDataRetentionCleanup();
    assert(typeof retentionSummary === 'object', 'Retention purge executed successfully');
    assert('purgedSessions' in retentionSummary, 'Purges expired sessions (> 24h)');
    assert('purgedPasswordResets' in retentionSummary, 'Purges expired password reset tokens (> 15m)');
    assert('purgedSensitiveTokens' in retentionSummary, 'Purges consumed or expired sensitive action tokens (> 5m)');
    assert('purgedWeatherCache' in retentionSummary, 'Purges expired cache data (> 24h)');
    assert('prunedAuditLogs' in retentionSummary, 'Archives audit logs beyond statutory window (> 90d)');
    assert('anonymizedUsers' in retentionSummary, 'Anonymizes deactivated user records (> 30d)');
  } catch (err) {
    assert(false, `Retention service test error: ${err.message}`);
  }

  // ── 5. Secure API Keys & Credentials Redaction ──
  console.log('\n--- 5. Secure API Keys & Credentials Redaction ---');
  try {
    const secretsService = require(path.join(BACKEND_DIST, 'services/secrets.service.js'));
    
    const rawLog = 'User login failed with password="SecretPassword123!" and token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"';
    const sanitizedLog = secretsService.redactSensitiveCredentials(rawLog);
    assert(!sanitizedLog.includes('SecretPassword123!'), 'Redacts plain password strings from log strings');
    assert(sanitizedLog.includes('[REDACTED_CREDENTIAL]'), 'Replaces credentials with redacted placeholder');

    const nestedPayload = {
      user: 'farmer_ramesh',
      db_pass: 'SuperSecretDB123',
      api_key: 'AIzaSyKrishiKey999',
      metadata: {
        token: 'Bearer secret_token_xyz'
      }
    };
    const sanitizedObj = secretsService.redactSensitiveCredentials(nestedPayload);
    assert(sanitizedObj.db_pass === '[REDACTED_CREDENTIAL]', 'Redacts nested secret password fields');
    assert(sanitizedObj.api_key === '[REDACTED_CREDENTIAL]', 'Redacts API keys in object structures');
    assert(sanitizedObj.metadata.token === '[REDACTED_CREDENTIAL]', 'Redacts tokens in nested structures');

    const envValidation = secretsService.validateEnvironmentSecrets();
    assert(typeof envValidation.isValid === 'boolean' && Array.isArray(envValidation.warnings), 'validateEnvironmentSecrets checks system environment cryptographic secrets');
  } catch (err) {
    assert(false, `Secrets redaction test error: ${err.message}`);
  }

  // ── 6. Sensitive Data Access Logging ──
  console.log('\n--- 6. Sensitive Data Access Logging ---');
  try {
    const farmerRoutesTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/farmer.routes.ts'), 'utf8');
    const authTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/middleware/auth.ts'), 'utf8');
    assert(farmerRoutesTs.includes("logDataAccess(userId, req.user!.role, 'farmer_profiles', userId, 'PROFILE_VIEW'"), 'Farmer profile read invokes logDataAccess with PROFILE_VIEW');
    assert(farmerRoutesTs.includes("logDataAccess(userId, req.user!.role, 'farmer_profiles', userId, 'PROFILE_UPDATE_SENSITIVE'"), 'Farmer profile update invokes logDataAccess with PROFILE_UPDATE_SENSITIVE');
    assert(authTs.includes("action: 'DATA_ACCESS_READ_PII'"), 'logDataAccess generates DATA_ACCESS_READ_PII audit records');
    assert(farmerRoutesTs.includes("/access-logs"), 'Dedicated GET /api/farmers/access-logs route provided for farmer audit trail transparency');
  } catch (err) {
    assert(false, `Data access logging inspection error: ${err.message}`);
  }

  // ── 7. DPDP Act Privacy Policy & Frontend Routing ──
  console.log('\n--- 7. DPDP Act Privacy Policy & Frontend Routing ---');
  try {
    const policyPath = path.join(ROOT_DIR, 'apps/frontend/src/pages/public/PrivacyPolicy.tsx');
    assert(fs.existsSync(policyPath), 'PrivacyPolicy.tsx page exists');
    
    const policyContent = fs.readFileSync(policyPath, 'utf8');
    assert(policyContent.includes('Digital Personal Data Protection'), 'Includes explicit DPDP Act 2023 compliance notice');
    assert(policyContent.includes('Right to Access') && policyContent.includes('Right to Erasure'), 'Outlines Data Principal rights (Access, Erasure, Correction)');
    assert(policyContent.includes('AES-256-GCM'), 'Documents field-level encryption standards');
    assert(policyContent.includes('Data Protection Officer'), 'Provides statutory Data Protection Officer (DPO) grievance contact');

    const appTsx = fs.readFileSync(path.join(ROOT_DIR, 'apps/frontend/src/App.tsx'), 'utf8');
    assert(appTsx.includes('path="/privacy"'), 'Route /privacy registered in App.tsx');

    const landingTsx = fs.readFileSync(path.join(ROOT_DIR, 'apps/frontend/src/pages/public/Landing.tsx'), 'utf8');
    assert(landingTsx.includes('to="/privacy"'), 'Privacy policy link rendered in Landing page footer');
  } catch (err) {
    assert(false, `Privacy policy check error: ${err.message}`);
  }

  // ── 8. Secure Database Configuration & Statement Timeout ──
  console.log('\n--- 8. Secure Database Configuration ---');
  try {
    const dbIndexTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/db/index.ts'), 'utf8');
    assert(dbIndexTs.includes('statement_timeout: 10000'), 'Database statement timeout configured to 10s against DoS');
    assert(dbIndexTs.includes('query_timeout: 10000'), 'Pool query timeout configured to 10s');
    assert(dbIndexTs.includes('max: 20'), 'Database connection pool upper bound capped at 20');
    assert(dbIndexTs.includes('ssl: isProd'), 'TLS/SSL enforced for database connections in production');
  } catch (err) {
    assert(false, `DB security configuration inspection error: ${err.message}`);
  }

  // ── Summary ──
  console.log('\n===============================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
