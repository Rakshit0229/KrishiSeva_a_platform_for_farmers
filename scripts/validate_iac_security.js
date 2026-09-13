#!/usr/bin/env node
/**
 * Automated Infrastructure as Code (IaC) Security Validator for KrishiSeva
 * Benchmarks: CIS Docker Benchmark, OWASP Docker Top 10, NIST SP 800-190
 *
 * Validates:
 * 1. Docker Compose Network Segmentation (internal: true, zero host DB exposure)
 * 2. Privilege Escalation Prevention (no-new-privileges: true)
 * 3. Resource Exhaustion Controls (cpu & memory limits)
 * 4. Container Healthchecks & Liveness
 * 5. Multi-stage Dockerfiles with unprivileged non-root USER
 * 6. Nginx Web Application Firewall rules & Anti-Fingerprinting
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

function runValidation() {
  console.log('===============================================================');
  console.log('    KRISHISEVA INFRASTRUCTURE AS CODE (IaC) SECURITY SCANNER   ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;
  const warnings = [];

  function check(condition, testName, remediation = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (remediation) console.error(`         💡 Remediation: ${remediation}`);
      failed++;
    }
  }

  // ── 1. Docker Compose Network Security & Isolation ──
  console.log('--- 1. Network Security Controls & Docker Segmentation ---');
  const composePath = path.join(ROOT_DIR, 'docker-compose.yml');
  if (!fs.existsSync(composePath)) {
    check(false, 'docker-compose.yml exists in repository root');
  } else {
    check(true, 'docker-compose.yml exists in repository root');
    const composeContent = fs.readFileSync(composePath, 'utf8');

    check(composeContent.includes('db_net:'), 'Defines dedicated internal database network (db_net)');
    check(composeContent.includes('internal: true'), 'Enforces "internal: true" isolation on database network (zero internet routing)');

    const hasPublicPostgres = composeContent.includes('"5432:5432"') || composeContent.includes("'5432:5432'");
    check(!hasPublicPostgres, 'PostgreSQL port 5432 is not exposed to public host interface', 'Remove ports: ["5432:5432"] and use internal network only');

    const hasPublicRedis = composeContent.includes('"6379:6379"') || composeContent.includes("'6379:6379'");
    check(!hasPublicRedis, 'Redis port 6379 is not exposed to public host interface', 'Remove ports: ["6379:6379"] and use internal network only');

    check(composeContent.includes('no-new-privileges:true'), 'Enforces security_opt: no-new-privileges:true against privilege escalation');

    check(composeContent.includes('resources:') && composeContent.includes('limits:'), 'Enforces CPU and Memory resource constraints to prevent DoS');
    check(composeContent.includes('healthcheck:'), 'Configures automated container healthchecks for resilience');
  }

  // ── 2. Nginx Web Application Firewall & Header Hardening ──
  console.log('\n--- 2. Nginx Reverse-Proxy Hardening & Network ACLs ---');
  const nginxPath = path.join(ROOT_DIR, 'nginx.conf');
  if (!fs.existsSync(nginxPath)) {
    check(false, 'nginx.conf exists in repository');
  } else {
    check(true, 'nginx.conf exists in repository');
    const nginxContent = fs.readFileSync(nginxPath, 'utf8');

    check(nginxContent.includes('server_tokens off;'), 'Anti-Fingerprinting: server_tokens off hides Nginx version');
    check(nginxContent.includes('X-Frame-Options') && nginxContent.includes('SAMEORIGIN'), 'Clickjacking defense: X-Frame-Options configured');
    check(nginxContent.includes('X-Content-Type-Options') && nginxContent.includes('nosniff'), 'MIME sniffing defense: X-Content-Type-Options: nosniff');
    check(nginxContent.includes('Content-Security-Policy'), 'XSS defense: Content-Security-Policy configured');
    check(nginxContent.includes('location ~ /\\.') && nginxContent.includes('deny all'), 'Network ACL: Blocks access to hidden files and dotfiles');
    check(nginxContent.includes('env|git|sql') && nginxContent.includes('deny all'), 'Network ACL: Blocks access to sensitive extensions (.env, .git, .sql)');
    check(nginxContent.includes('client_max_body_size'), 'Resource defense: client_max_body_size restricts large request attacks');
  }

  // ── 3. Dockerfile Container Security Configuration ──
  console.log('\n--- 3. Container Images & Non-Root Runtime Configuration ---');
  const backendDockerPath = path.join(ROOT_DIR, 'apps/backend/Dockerfile');
  if (!fs.existsSync(backendDockerPath)) {
    check(false, 'apps/backend/Dockerfile exists');
  } else {
    check(true, 'apps/backend/Dockerfile exists');
    const backendDocker = fs.readFileSync(backendDockerPath, 'utf8');

    check(backendDocker.includes('AS builder') && backendDocker.includes('AS runner'), 'Backend uses multi-stage build pattern to minimize attack surface');
    check(backendDocker.includes('USER node'), 'Backend runs as unprivileged non-root user (USER node)', 'Never run container as root in production');
    check(backendDocker.includes('HEALTHCHECK'), 'Backend container defines runtime HEALTHCHECK');
    check(!backendDocker.includes('npm run dev'), 'Production Dockerfile executes compiled production runtime');
  }

  const frontendDockerPath = path.join(ROOT_DIR, 'apps/frontend/Dockerfile');
  if (!fs.existsSync(frontendDockerPath)) {
    check(false, 'apps/frontend/Dockerfile exists');
  } else {
    check(true, 'apps/frontend/Dockerfile exists');
    const frontendDocker = fs.readFileSync(frontendDockerPath, 'utf8');

    check(frontendDocker.includes('AS builder') && frontendDocker.includes('AS runner'), 'Frontend uses multi-stage build pattern');
    check(frontendDocker.includes('HEALTHCHECK'), 'Frontend container defines runtime HEALTHCHECK');
  }

  // ── Summary ──
  console.log('\n===============================================================');
  console.log(`  IaC SCAN RESULT: ${passed} CHECKS PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runValidation();
