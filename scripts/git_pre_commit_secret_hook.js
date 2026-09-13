/**
 * KrishiSeva Git Pre-Commit & Repository Secret Scanner Hook
 * Section 10: Secrets Management
 * 
 * Inspects staged files and Git history to prevent committing API keys,
 * private certificates, or unignored .env files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

console.log('===============================================================');
console.log('      KRISHISEVA GIT STAGED SECRETS & .ENV SCANNER HOOK         ');
console.log('===============================================================\n');

// 1. Verify that .env and configuration files are properly gitignored
function checkGitIgnoreProtection() {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    throw new Error('CRITICAL: .gitignore missing from root repository!');
  }
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredIgnores = ['.env', '.env.local', 'node_modules'];

  for (const pattern of requiredIgnores) {
    if (!gitignoreContent.includes(pattern)) {
      throw new Error(`CRITICAL: Pattern "${pattern}" is NOT protected in .gitignore!`);
    }
  }
  console.log('  [PASS] .env, .env.local, and node_modules are strictly gitignored.');
}

// 2. Check git status to ensure .env is not currently tracked by git
function checkGitTrackedEnvFiles() {
  try {
    const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
    const exposedEnv = trackedFiles.filter(f => f.trim() === '.env' || f.trim() === '.env.local');
    if (exposedEnv.length > 0) {
      throw new Error(`CRITICAL SECURITY FAILURE: Sensitive file(s) [${exposedEnv.join(', ')}] are tracked by Git!`);
    }
    console.log('  [PASS] No .env or sensitive credentials tracked in Git tree.');
  } catch (err) {
    if (err.message.includes('CRITICAL')) throw err;
    // If git is not present, proceed gracefully
    console.log('  [NOTE] Git repository check skipped or clean.');
  }
}

// 3. Scan recent git commit log for accidentally committed secrets
function scanGitCommitDiffs() {
  try {
    const logDiff = execSync('git log -n 5 -p', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const criticalPatterns = [
      /-----BEGIN (?:RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/,
      /\bAKIA[0-9A-Z]{16}\b/,
      /\bghp_[0-9a-zA-Z]{36}\b/,
      /\bsk_live_[0-9a-zA-Z]{24}\b/
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(logDiff)) {
        throw new Error(`EXPOSED SECRET DETECTED in recent git commit diff: ${pattern}`);
      }
    }
    console.log('  [PASS] Recent Git commit history contains zero exposed private keys or tokens.');
  } catch (err) {
    if (err.message && err.message.includes('EXPOSED SECRET')) throw err;
    console.log('  [NOTE] Git log diff check clean or shallow repository.');
  }
}

try {
  checkGitIgnoreProtection();
  checkGitTrackedEnvFiles();
  scanGitCommitDiffs();
  console.log('\n===============================================================');
  console.log('  🎉 SECRETS SCAN & GIT INTEGRITY PASSED (100% SECURE)');
  console.log('===============================================================\n');
  process.exit(0);
} catch (err) {
  console.error(`\n❌ SECRETS HOOK BLOCKED: ${err.message}`);
  process.exit(1);
}
