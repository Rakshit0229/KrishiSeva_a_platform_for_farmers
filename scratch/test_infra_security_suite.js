/**
 * Automated Verification Test Suite for Section 5: Infrastructure & Deployment Security
 * Checks all 4 requirements:
 * 1. Network Security Controls (IP Firewall, Network Segmentation, Nginx WAF rules)
 * 2. Infrastructure Security Checks (IaC CIS & OWASP validation)
 * 3. Logging & Monitoring (Structured JSON logs, HMAC integrity seal, Infra Health API)
 * 4. Secure Container Configuration (Multi-stage Dockerfiles, USER node, resource constraints)
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = process.cwd();
const jwt = require(path.join(ROOT_DIR, 'node_modules/jsonwebtoken'));
const { app, initializeBackend } = require(path.join(ROOT_DIR, 'apps/backend/dist/app.js'));
const { memoryStore } = require(path.join(ROOT_DIR, 'apps/backend/dist/db/index.js'));
const { logStructured, getStructuredLogs, verifyLogSeal } = require(path.join(ROOT_DIR, 'apps/backend/dist/services/logger.service.js'));
const { blacklistIp, unblacklistIp, isInternalNetworkIp } = require(path.join(ROOT_DIR, 'apps/backend/dist/middleware/firewall.js'));

let server;
let baseUrl;

async function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const req = http.request(url, {
      method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log('  KRISHISEVA INFRASTRUCTURE & DEPLOYMENT SECURITY (SECTION 5)  ');
  console.log('===============================================================\n');

  await initializeBackend();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

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

  try {
    const secret = process.env.JWT_SECRET || 'krishiseva_secure_secret_key_change_in_production';
    const adminToken = jwt.sign(
      { id: 'admin-infra-test', phone: '+919999999999', name: 'Infra Admin', role: 'admin' },
      secret,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    // ── 1. Network Security Controls ──
    console.log('--- 1. Network Security Controls ---');
    // Test internal network IP evaluation
    assert(isInternalNetworkIp('127.0.0.1'), 'Identifies loopback IP as internal');
    assert(isInternalNetworkIp('192.168.1.50'), 'Identifies private subnet 192.168.x as internal');
    assert(isInternalNetworkIp('10.200.1.1'), 'Identifies private subnet 10.x as internal');
    assert(!isInternalNetworkIp('203.0.113.195'), 'Identifies public routable IP as external');

    // Test IP Firewall blacklisting
    const testMaliciousIp = '198.51.100.99';
    blacklistIp(testMaliciousIp, 'Simulated threat actor');
    const blockedRes = await request('GET', '/api/v1/health', null, {
      'X-Forwarded-For': testMaliciousIp
    });
    assert(blockedRes.status === 403, 'Network firewall blocks blacklisted IP with 403 Forbidden');
    assert(blockedRes.data.code === 'FIREWALL_IP_BLOCKED', 'Returns FIREWALL_IP_BLOCKED code');
    unblacklistIp(testMaliciousIp);

    const composeText = fs.readFileSync(path.join(ROOT_DIR, 'docker-compose.yml'), 'utf8');
    assert(composeText.includes('internal: true'), 'Docker compose isolates database network with internal: true');
    assert(!composeText.includes('"5432:5432"'), 'PostgreSQL port 5432 is not exposed to host network');
    assert(!composeText.includes('"6379:6379"'), 'Redis port 6379 is not exposed to host network');

    const nginxText = fs.readFileSync(path.join(ROOT_DIR, 'nginx.conf'), 'utf8');
    assert(nginxText.includes('server_tokens off;'), 'Nginx server_tokens off hides web server version');
    assert(nginxText.includes('X-Frame-Options') && nginxText.includes('Content-Security-Policy'), 'Nginx configures security headers');
    assert(nginxText.includes('location ~ /\\.'), 'Nginx blocks dotfiles and hidden path traversal');

    // ── 2. Infrastructure Security Checks ──
    console.log('\n--- 2. Infrastructure Security Checks (IaC Validation) ---');
    const iacScriptPath = path.join(ROOT_DIR, 'scripts/validate_iac_security.js');
    assert(fs.existsSync(iacScriptPath), 'Automated IaC validator script exists');

    const ciWorkflowPath = path.join(ROOT_DIR, '.github/workflows/security-ci.yml');
    assert(fs.existsSync(ciWorkflowPath), 'GitHub Actions security CI/CD pipeline defined');
    const ciContent = fs.readFileSync(ciWorkflowPath, 'utf8');
    assert(ciContent.includes('validate_iac_security.js'), 'CI pipeline executes automated IaC security scanner');
    assert(ciContent.includes('test_security_suite.js'), 'CI pipeline runs end-to-end security test suites');

    // ── 3. Logging & Monitoring ──
    console.log('\n--- 3. Logging & Monitoring (Incident Detection & HMAC Integrity) ---');
    const logEntry = logStructured('INFO', 'infra_test', 'Infrastructure health check initialized', {
      correlation_id: 'corr-1001',
      metadata: { test_key: 'test_val' }
    });
    assert(logEntry.timestamp && logEntry.level === 'INFO', 'Structured logger outputs machine-parsable JSON format');
    assert(logEntry.hmac_seal, 'Structured log entry is cryptographically sealed with HMAC');
    assert(verifyLogSeal(logEntry), 'Verifies untampered log entry HMAC seal');

    // Tamper detection test
    const tamperedLog = { ...logEntry, message: 'Attacker modified log entry message' };
    assert(!verifyLogSeal(tamperedLog), 'Rejects tampered audit log with modified content');

    // Sensitive data redaction in logger
    const sensitiveLog = logStructured('WARN', 'auth_audit', 'User login failed with password="SecretPassword999!" and token="eyJhbGciOiJIUzI1NiJ9"');
    assert(!sensitiveLog.message.includes('SecretPassword999!'), 'Logger automatically redacts passwords from log strings');
    assert(sensitiveLog.message.includes('[REDACTED_CREDENTIAL]'), 'Logger replaces credentials with [REDACTED_CREDENTIAL]');

    // Test Infrastructure Health Endpoint
    const healthRes = await request('GET', '/api/v1/admin/infra/health', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(healthRes.status === 200, 'Admin can retrieve real-time infrastructure health metrics');
    assert(healthRes.data.status === 'HEALTHY_OPERATIONAL', 'Infrastructure reports operational health');
    assert(healthRes.data.process && healthRes.data.process.rss_mb > 0, 'Health endpoint monitors memory and process metrics');
    assert(healthRes.data.network_security && healthRes.data.network_security.firewall_active, 'Health endpoint verifies firewall and network segmentation');

    // Test Infrastructure Logs Endpoint
    const logsRes = await request('GET', '/api/v1/admin/infra/logs', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(logsRes.status === 200 && Array.isArray(logsRes.data.logs), 'Admin can query structured audit and incident logs');

    // Test Overall Security Posture Summary Endpoint
    const summaryRes = await request('GET', '/api/v1/admin/infra/security-summary', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(summaryRes.status === 200, 'Admin can retrieve comprehensive multi-section security summary');
    assert(summaryRes.data.sections.section_1_auth.status === 'COMPLIANT', 'Section 1 Authentication: COMPLIANT');
    assert(summaryRes.data.sections.section_2_input_validation.status === 'COMPLIANT', 'Section 2 Input Validation: COMPLIANT');
    assert(summaryRes.data.sections.section_3_data_protection.status === 'COMPLIANT', 'Section 3 Data Protection: COMPLIANT');
    assert(summaryRes.data.sections.section_4_api_security.status === 'COMPLIANT', 'Section 4 API Security: COMPLIANT');
    assert(summaryRes.data.sections.section_5_infra_deployment.status === 'COMPLIANT', 'Section 5 Infrastructure & Deployment: COMPLIANT');
    assert(summaryRes.data.overall_posture === 'GRADE_A_SECURE', 'Overall posture evaluated as GRADE_A_SECURE');

    // ── 4. Secure Container Configuration ──
    console.log('\n--- 4. Secure Container Configuration ---');
    const backendDocker = fs.readFileSync(path.join(ROOT_DIR, 'apps/backend/Dockerfile'), 'utf8');
    assert(backendDocker.includes('USER node'), 'Backend Dockerfile executes as unprivileged USER node');
    assert(backendDocker.includes('HEALTHCHECK'), 'Backend Dockerfile defines container HEALTHCHECK');
    assert(backendDocker.includes('AS builder') && backendDocker.includes('AS runner'), 'Backend Dockerfile implements multi-stage build pattern');

    const frontendDocker = fs.readFileSync(path.join(ROOT_DIR, 'apps/frontend/Dockerfile'), 'utf8');
    assert(frontendDocker.includes('HEALTHCHECK'), 'Frontend Dockerfile defines container HEALTHCHECK');
    assert(frontendDocker.includes('AS builder') && frontendDocker.includes('AS runner'), 'Frontend Dockerfile implements multi-stage build pattern');

    assert(composeText.includes('no-new-privileges:true'), 'Docker compose enforces no-new-privileges on all containers');
    assert(composeText.includes('limits:') && composeText.includes('memory:'), 'Docker compose sets memory resource limits');
    assert(composeText.includes('cpus:'), 'Docker compose sets CPU resource limits');

    // ── Summary ──
    console.log('\n===============================================================');
    console.log(`  🎉 INFRASTRUCTURE SECURITY SUITE: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
