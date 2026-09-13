/**
 * KrishiSeva Unified Enterprise Security Master Test Runner
 * Orchestrates all verification suites across Sections 1 through 8.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = process.cwd();

console.log('===============================================================');
console.log('    KRISHISEVA UNIFIED ENTERPRISE SECURITY MASTER TEST RUNNER  ');
console.log('    Sections 1 to 8 Full Compliance & Automated Verification   ');
console.log('===============================================================\n');

const SUITES = [
  {
    name: 'Section 1 & 2: Auth, Session, & Input Validation',
    command: 'node scratch/test_security_suite.js',
  },
  {
    name: 'Section 3: Data Protection & Privacy (DPDP Act)',
    command: 'node scratch/test_privacy_security_suite.js',
  },
  {
    name: 'Section 4: API Security, Versioning, & Rate Limiting',
    command: 'node scratch/test_api_security_suite.js',
  },
  {
    name: 'Section 5: Infrastructure & Deployment Security',
    command: 'node scratch/test_infra_security_suite.js',
  },
  {
    name: 'Section 5: Infrastructure as Code (IaC) Scanner',
    command: 'node scripts/validate_iac_security.js',
  },
  {
    name: 'Section 6: Frontend Security (CSP, SRI, CORS, CSRF)',
    command: 'node scratch/test_frontend_security_suite.js',
  },
  {
    name: 'Section 7: Dependency & Supply Chain Scanner',
    command: 'node scripts/scan_dependencies.js',
  },
  {
    name: 'Section 7: Software Bill of Materials (SBOM) Generation',
    command: 'node scripts/generate_sbom.js',
  },
  {
    name: 'Section 8: Static Application Security Testing (SAST)',
    command: 'node scripts/sast_scanner.js',
  },
  {
    name: 'Section 8: Dynamic Application Security Testing (DAST)',
    command: 'node scripts/dast_scanner.js',
  },
  {
    name: 'Section 8: Secret Leak & Exposed Credential Scanner',
    command: 'node scripts/scan_secrets.js',
  },
  {
    name: 'Section 8: Comprehensive OWASP Top 10 Suite',
    command: 'node scratch/test_owasp_top10_suite.js',
  },
];

const results = [];
let allPassed = true;

for (const suite of SUITES) {
  console.log(`\n▶️ Executing: ${suite.name}...`);
  const startTime = Date.now();
  try {
    execSync(suite.command, { stdio: 'inherit', cwd: ROOT_DIR });
    const durationMs = Date.now() - startTime;
    results.push({ name: suite.name, status: 'PASSED', durationMs });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    results.push({ name: suite.name, status: 'FAILED', durationMs });
    allPassed = false;
  }
}

console.log('\n===============================================================');
console.log('       KRISHISEVA SECURITY COMPLIANCE SCORECARD (SECTIONS 1-8)  ');
console.log('===============================================================');

results.forEach((r, idx) => {
  const symbol = r.status === 'PASSED' ? '✅' : '❌';
  console.log(`  ${symbol} Suite ${idx + 1}: ${r.name.padEnd(54)} [${r.status}] (${(r.durationMs / 1000).toFixed(1)}s)`);
});

console.log('===============================================================');
if (allPassed) {
  console.log('  🎉 100% SECURITY COMPLIANCE ACHIEVED ACROSS ALL 8 SECTIONS!');
  console.log('  Enterprise Grade A+ Security Posture Confirmed.');
  console.log('===============================================================\n');
  process.exit(0);
} else {
  console.error('  ❌ ONE OR MORE SECURITY SUITES FAILED. REVIEW LOGS ABOVE.');
  console.log('===============================================================\n');
  process.exit(1);
}
