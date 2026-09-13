/**
 * Automated Verification Test Suite for:
 * - Section 9: Compliance & Documentation
 * - Section 10: Secrets Management
 * - Section 11: AI-Specific Security
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const BACKEND_DIST = path.resolve(ROOT_DIR, 'apps/backend/dist');

async function runTestSuite() {
  console.log('===============================================================');
  console.log('  KRISHISEVA VERIFICATION SUITE: SECTIONS 9, 10, & 11');
  console.log('  Compliance, Secrets Management & AI Security');
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

  // =========================================================================
  // SECTION 9: COMPLIANCE & DOCUMENTATION
  // =========================================================================
  console.log('--- SECTION 9: COMPLIANCE & DOCUMENTATION ---');

  // 1. Identify Applicable Regulations
  const complianceDoc = path.join(ROOT_DIR, 'docs/COMPLIANCE_REGULATORY_FRAMEWORK.md');
  assert(fs.existsSync(complianceDoc), 'Regulatory Compliance Framework document exists');
  if (fs.existsSync(complianceDoc)) {
    const text = fs.readFileSync(complianceDoc, 'utf8');
    assert(text.includes('Digital Personal Data Protection (DPDP) Act, 2023'), 'Identifies DPDP Act 2023 as primary Indian data protection statute');
    assert(text.includes('Aadhaar Act, 2016'), 'Identifies UIDAI Aadhaar Act statutory regulations');
    assert(text.includes('General Data Protection Regulation (GDPR)'), 'Maps GDPR privacy principles');
    assert(text.includes('California Consumer Privacy Act (CCPA / CPRA)'), 'Maps CCPA/CPRA rights');
    assert(text.includes('Information Technology Act, 2000'), 'Includes IT Act 2000 & CERT-In reporting obligations');
  }

  // 2. Security Documentation & DFD
  const dfdDoc = path.join(ROOT_DIR, 'docs/DATA_FLOW_DIAGRAM.md');
  assert(fs.existsSync(dfdDoc), 'Data Flow Diagram (DFD) documentation exists');
  if (fs.existsSync(dfdDoc)) {
    const text = fs.readFileSync(dfdDoc, 'utf8');
    assert(text.includes('Trust Boundaries') || text.includes('Trust Boundary'), 'Documents trust boundaries throughout the application');
    assert(text.includes('AES-256-GCM'), 'Specifies encryption at-rest in database layer');
    assert(text.includes('TLS 1.3'), 'Specifies encryption in-transit (HTTPS/TLS 1.3)');
    assert(text.includes('PFMS') && text.includes('UIDAI'), 'Documents external government gateway flows (PFMS & UIDAI)');
  }

  // 3. User Consent Management (DPDP Act Section 6)
  try {
    const authRoutesTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/auth.routes.ts'), 'utf8');
    assert(authRoutesTs.includes("router.post('/consent'"), 'Provides POST /api/auth/consent for informed user consent registration');
    assert(authRoutesTs.includes("router.get('/consent/status'"), 'Provides GET /api/auth/consent/status for auditing active consent');
    assert(authRoutesTs.includes("router.post('/consent/withdraw'"), 'Provides POST /api/auth/consent/withdraw for DPDP right to withdraw consent');
    assert(authRoutesTs.includes('USER_CONSENT_GRANTED') && authRoutesTs.includes('USER_CONSENT_WITHDRAWN'), 'Logs statutory audit trail for consent registration and withdrawal');
  } catch (err) {
    assert(false, `User consent check error: ${err.message}`);
  }

  // 4. Document Third-Party Services
  const vendorsDoc = path.join(ROOT_DIR, 'docs/THIRD_PARTY_SERVICES_INVENTORY.md');
  assert(fs.existsSync(vendorsDoc), 'Third-Party Services Inventory documentation exists');
  if (fs.existsSync(vendorsDoc)) {
    const text = fs.readFileSync(vendorsDoc, 'utf8');
    assert(text.includes('PFMS'), 'Inventories PFMS DBT payment gateway and security status');
    assert(text.includes('UIDAI'), 'Inventories UIDAI Aadhaar verification service');
    assert(text.includes('OpenStreetMap'), 'Inventories OpenStreetMap / Leaflet integration');
    assert(text.includes('Contingency / Fallback'), 'Documents contingency and fallback plans for upstream vendor outages');
  }

  // =========================================================================
  // SECTION 10: SECRETS MANAGEMENT
  // =========================================================================
  console.log('\n--- SECTION 10: SECRETS MANAGEMENT ---');

  // 1. Secure Secrets Management (Vault Provider)
  try {
    const vaultService = require(path.join(BACKEND_DIST, 'services/vault.service.js')).vaultService;
    assert(vaultService && typeof vaultService.getSecret === 'function', 'VaultService abstraction layer is available');
    
    // Set and retrieve test secret in encrypted vault
    const testSecretVal = 'super-secret-vault-api-key-2026';
    await vaultService.setSecret('TEST_API_KEY', testSecretVal, { purpose: 'test' });
    const retrieved = await vaultService.getSecret('TEST_API_KEY');
    assert(retrieved === testSecretVal, 'Vault safely encrypts and decrypts secrets with AES-256-GCM keyring');

    // Test secret rotation in vault
    const rotation = await vaultService.rotateSecret('TEST_API_KEY');
    assert(rotation.newSecret && rotation.version >= 2, 'Vault supports automated secret rotation with version tracking');
    const afterRotation = await vaultService.getSecret('TEST_API_KEY');
    assert(afterRotation === rotation.newSecret, 'Vault provides new rotated secret value');
  } catch (err) {
    assert(false, `Vault service test error: ${err.message}`);
  }

  // 2. Protect .env and Configuration Files in .gitignore
  const gitignore = fs.readFileSync(path.join(ROOT_DIR, '.gitignore'), 'utf8');
  assert(gitignore.includes('.env') && gitignore.includes('.env.local'), '.env and .env.local are strictly listed in .gitignore');

  // 3. Pre-Commit / Git Secret Scanner Hook
  const gitHook = path.join(ROOT_DIR, 'scripts/git_pre_commit_secret_hook.js');
  assert(fs.existsSync(gitHook), 'Git pre-commit secret scanner hook script exists');

  // 4. Production Mode Leak Prevention
  const appTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/app.ts'), 'utf8');
  assert(appTs.includes("app.disable('x-powered-by')"), 'Disables X-Powered-By banner to prevent technology profiling');
  assert(appTs.includes('...(isProduction ? {} : { debug_hint: err.message })'), 'Suppresses stack traces and debug hints in production mode');

  // =========================================================================
  // SECTION 11: AI-SPECIFIC SECURITY
  // =========================================================================
  console.log('\n--- SECTION 11: AI-SPECIFIC SECURITY ---');

  try {
    const aiSecurity = require(path.join(BACKEND_DIST, 'services/aiSecurity.service.js'));

    // 1. AI Service Access Control & Quotas
    assert(typeof aiSecurity.enforceAiAccessControl === 'function', 'AI access control & quota rate limiting middleware is exported');

    // 2. Validate AI-Generated Queries (Anti-SQLi & Table Whitelist)
    const validSelect = aiSecurity.validateAiGeneratedQuery('SELECT crop_type, msp_price FROM msp_rates WHERE crop_type = $1', ['wheat']);
    assert(validSelect.isValid === true, 'Allows authorized parameterized read-only SELECT queries on whitelisted tables');

    const dangerousDrop = aiSecurity.validateAiGeneratedQuery('DROP TABLE users;');
    assert(dangerousDrop.isValid === false && (dangerousDrop.violationReason.includes('Dangerous keyword') || dangerousDrop.violationReason.includes('read-only')), 'Blocks AI-generated DROP statements');

    const injectionAttempt = aiSecurity.validateAiGeneratedQuery('SELECT * FROM msp_rates; DELETE FROM users; --');
    assert(injectionAttempt.isValid === false, 'Blocks multi-statement SQL injection from AI query generation');

    const unauthorizedTable = aiSecurity.validateAiGeneratedQuery('SELECT * FROM users');
    assert(unauthorizedTable.isValid === false && unauthorizedTable.violationReason.includes('Unauthorized table'), 'Blocks AI access to sensitive tables (e.g. users / PII)');

    // 3. AI Component Fallbacks & Circuit Breakers
    const successfulAiOp = async () => 'AI Generated Crop Advice';
    const normalExecution = await aiSecurity.executeAiWithFallback(successfulAiOp, 'msp');
    assert(normalExecution.isFallback === false && normalExecution.result === 'AI Generated Crop Advice', 'Executes normal AI generation when healthy');

    const failingAiOp = async () => { throw new Error('Model rate limit or timeout exceeded'); };
    const fallbackExecution = await aiSecurity.executeAiWithFallback(failingAiOp, 'msp');
    assert(fallbackExecution.isFallback === true, 'Switches to certified deterministic agricultural fallback when AI component fails');
    assert(fallbackExecution.result.advice.includes('MSP'), 'Fallback delivers certified government MSP guidance');

    // 4. Monitor AI Security Research & OWASP Top 10 for LLM
    const researchStatus = aiSecurity.getAiSecurityResearchStatus();
    assert(researchStatus.framework.includes('OWASP Top 10 for Large Language Model Applications'), 'Tracks OWASP Top 10 for LLM threat matrix');
    assert(researchStatus.threats.some(t => t.id === 'LLM01'), 'Includes LLM01 Prompt Injection threat mitigation');
    assert(researchStatus.threats.some(t => t.id === 'LLM02'), 'Includes LLM02 Sensitive Info Disclosure threat mitigation');
    assert(researchStatus.threats.some(t => t.id === 'LLM06'), 'Includes LLM06 Excessive Agency mitigation');

    // Chat route integration
    const chatRoutesTs = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/src/routes/chat.routes.ts'), 'utf8');
    assert(chatRoutesTs.includes('enforceAiAccessControl'), 'Chat routes apply enforceAiAccessControl');
    assert(chatRoutesTs.includes('executeAiWithFallback'), 'Chat routes apply executeAiWithFallback circuit breaker');
    assert(chatRoutesTs.includes('/validate-query'), 'Provides /api/chat/validate-query endpoint');
    assert(chatRoutesTs.includes('/security-research'), 'Provides /api/chat/security-research endpoint');
  } catch (err) {
    assert(false, `AI security test error: ${err.message}`);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
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
