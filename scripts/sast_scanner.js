/**
 * KrishiSeva Static Application Security Testing (SAST) Scanner
 * Section 8: SAST Testing
 * 
 * Analyzes frontend and backend source code against OWASP Top 10 anti-patterns,
 * hardcoded secrets, unsafe DOM manipulation, injection vulnerabilities, and weak cryptography.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

console.log('===============================================================');
console.log('      KRISHISEVA STATIC APPLICATION SECURITY TESTING (SAST)    ');
console.log('===============================================================\n');

const RULES = [
  {
    id: 'SEC-SAST-001',
    name: 'Unsafe DOM InnerHTML Injection',
    severity: 'HIGH',
    pattern: /dangerouslySetInnerHTML/g,
    description: 'Avoid dangerouslySetInnerHTML to prevent DOM Cross-Site Scripting (XSS).',
  },
  {
    id: 'SEC-SAST-002',
    name: 'Dynamic Code Evaluation',
    severity: 'CRITICAL',
    pattern: /\b(?:eval|Function)\s*\([^)]*\)/g,
    description: 'Dynamic code execution via eval() or Function constructor is strictly prohibited.',
    ignoreFiles: ['node_modules', 'sast_scanner.js', 'test_'],
  },
  {
    id: 'SEC-SAST-003',
    name: 'Hardcoded Private Key or Certificate',
    severity: 'CRITICAL',
    pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/g,
    description: 'Private cryptographic keys must never be committed to repository source.',
  },
  {
    id: 'SEC-SAST-004',
    name: 'Hardcoded Cloud or API Token',
    severity: 'HIGH',
    pattern: /(?:AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|sk_live_[0-9a-zA-Z]{24})/g,
    description: 'Cloud API credentials and GitHub personal access tokens must use environment variables.',
  },
  {
    id: 'SEC-SAST-005',
    name: 'Unsafe SQL Query Concatenation',
    severity: 'HIGH',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*['"]\s*\+\s*(?:req\.|params\.|query\.|body\.)/gi,
    description: 'SQL queries must use parameterized queries ($1, $2) rather than string concatenation.',
  },
  {
    id: 'SEC-SAST-006',
    name: 'Insecure Math.random in Cryptographic Flow',
    severity: 'MEDIUM',
    pattern: /(?:token|secret|salt|key|password|challenge)\s*[:=].*Math\.random/gi,
    description: 'Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive tokens.',
  },
  {
    id: 'SEC-SAST-007',
    name: 'Unsafe Shell Command Execution with Variables',
    severity: 'HIGH',
    pattern: /exec\s*\(\s*`[^`]*\$\{/g,
    description: 'Avoid template strings in exec() to mitigate OS command injection.',
  },
];

const SCAN_DIRS = [
  path.join(ROOT_DIR, 'apps/backend/src'),
  path.join(ROOT_DIR, 'apps/frontend/src'),
];

let scannedFiles = 0;
let findings = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDirectory(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      scannedFiles++;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const rule of RULES) {
        if (rule.ignoreFiles && rule.ignoreFiles.some((f) => entry.name.includes(f))) {
          continue;
        }

        let match;
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
        while ((match = regex.exec(content)) !== null) {
          // Determine line number
          const lineNo = content.substring(0, match.index).split('\n').length;
          const snippet = (lines[lineNo - 1] || '').trim();

          findings.push({
            ruleId: rule.id,
            name: rule.name,
            severity: rule.severity,
            file: path.relative(ROOT_DIR, fullPath),
            line: lineNo,
            snippet,
            description: rule.description,
          });
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDirectory(dir);
}

console.log(`Audited ${scannedFiles} source files across frontend and backend.\n`);

if (findings.length === 0) {
  console.log('===============================================================');
  console.log('  🎉 SAST SCAN PASSED: ZERO VULNERABILITIES IDENTIFIED');
  console.log(`  Scanned: ${scannedFiles} files across 7 enterprise SAST rule sets.`);
  console.log('===============================================================\n');
  process.exit(0);
} else {
  console.error(`❌ SAST SCAN FAILED: ${findings.length} security finding(s) detected:\n`);
  findings.forEach((f) => {
    console.error(`  [${f.severity}] ${f.ruleId}: ${f.name}`);
    console.error(`    File: ${f.file}:${f.line}`);
    console.error(`    Code: ${f.snippet}`);
    console.error(`    Fix:  ${f.description}\n`);
  });
  process.exit(1);
}
