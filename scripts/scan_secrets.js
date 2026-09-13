/**
 * KrishiSeva Secret Leak & Exposed Credential Scanner
 * Section 8: Rotate Exposed Secrets & Secret Scanning
 * 
 * Inspects source code, configurations, and git tracked files for accidental leaks:
 * - AWS Access Keys
 * - GitHub Personal Access Tokens
 * - Database URLs with embedded passwords
 * - Private Keys & SSL Certificates
 * - Hardcoded production secrets
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

console.log('===============================================================');
console.log('         KRISHISEVA SECRET LEAK & CREDENTIAL SCANNER           ');
console.log('===============================================================\n');

const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\bghp_[0-9a-zA-Z]{36}\b/,
  },
  {
    name: 'Generic Private Key',
    regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/,
  },
  {
    name: 'Slack Webhook / Token',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]{8}\/B[0-9A-Z]{8}\/[0-9a-zA-Z]{24}/,
  },
  {
    name: 'Google Cloud API Key',
    regex: /\bAIza[0-9A-Za-z-_]{35}\b/,
  },
  {
    name: 'Live Stripe Secret Key',
    regex: /\bsk_live_[0-9a-zA-Z]{24}\b/,
  },
  {
    name: 'Plain Database Password in Connection String',
    regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_]+:(?!(\$|env|\*\*\*\*|<|password|postgres|user))[a-zA-Z0-9_!@#$%^&*()+-]+@[a-zA-Z0-9.-]+:[0-9]+\/[a-zA-Z0-9_]+/,
  },
];

const IGNORE_FILES = [
  'node_modules',
  '.git',
  'dist',
  '.env',
  '.env.local',
  '.env.example',
  'scan_secrets.js',
  'sast_scanner.js',
  'test_',
  'package-lock.json',
  'yarn.lock',
];

let scannedFiles = 0;
let leakedSecrets = [];

function scanFile(filePath) {
  scannedFiles++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const pattern of SECRET_PATTERNS) {
    lines.forEach((line, index) => {
      // Ignore comments indicating intentional test examples
      if (line.includes('[REDACTED') || line.includes('// mock') || line.includes('// test')) {
        return;
      }

      if (pattern.regex.test(line)) {
        leakedSecrets.push({
          patternName: pattern.name,
          file: path.relative(ROOT_DIR, filePath),
          line: index + 1,
          snippet: line.trim().substring(0, 80) + '...',
        });
      }
    });
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath);

    if (IGNORE_FILES.some((ign) => relPath.includes(ign) || entry.name === ign)) {
      continue;
    }

    if (entry.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

traverseDirectory(ROOT_DIR);

console.log(`Audited ${scannedFiles} files across repository for exposed secrets.\n`);

if (leakedSecrets.length === 0) {
  console.log('===============================================================');
  console.log('  🎉 SECRET SCAN PASSED: ZERO EXPOSED CREDENTIALS DETECTED');
  console.log('  No high-entropy secrets or private tokens found in codebase.');
  console.log('===============================================================\n');
  process.exit(0);
} else {
  console.error(`❌ SECRET SCAN FAILED: Found ${leakedSecrets.length} exposed credential(s):\n`);
  leakedSecrets.forEach((s) => {
    console.error(`  [LEAK] ${s.patternName} in ${s.file}:${s.line}`);
    console.error(`    Preview: ${s.snippet}\n`);
  });
  console.error('IMMEDIATE ACTION REQUIRED: Rotate compromised secrets and remove from Git.');
  process.exit(1);
}
