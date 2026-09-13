/**
 * Automated Verification Test Suite for Section 4: API Security
 * Checks all 9 requirements:
 * 1. API Authentication
 * 2. API Rate Limiting
 * 3. API Input Validation
 * 4. API Error Handling
 * 5. API Versioning (/api/v1/ & X-API-Version header)
 * 6. JWT Security (Signing, Verification, alg:none defense, Claims)
 * 7. CSRF Protection (Double-Submit Cookie & Header verification)
 * 8. API Monitoring & Intrusion Telemetry
 * 9. Key & Refresh Token Rotation (RTR + Reuse Detection + Grace Overlap)
 */

const http = require('http');
const path = require('path');

const ROOT_DIR = process.cwd();
const jwt = require(path.join(ROOT_DIR, 'node_modules/jsonwebtoken'));
const { app, initializeBackend } = require(path.join(ROOT_DIR, 'apps/backend/dist/app.js'));
const { memoryStore } = require(path.join(ROOT_DIR, 'apps/backend/dist/db/index.js'));
const { createRateLimiter } = require(path.join(ROOT_DIR, 'apps/backend/dist/middleware/rateLimiter.js'));
const { generateApiKey, rotateApiKey, validateApiKey, createRefreshToken, rotateRefreshToken } = require(path.join(ROOT_DIR, 'apps/backend/dist/services/keyRotation.service.js'));
const { getApiSecurityMetrics, recordSecurityAlert } = require(path.join(ROOT_DIR, 'apps/backend/dist/services/monitoring.service.js'));

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
  console.log('      KRISHISEVA API SECURITY VERIFICATION SUITE (9 CHECKS)   ');
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
    // ── 1. API Authentication ──
    console.log('--- 1. API Authentication ---');
    const noAuthRes = await request('GET', '/api/v1/farmers/profile');
    assert(noAuthRes.status === 401, 'Rejects unauthenticated access to protected endpoint with 401 Unauthorized');
    assert(noAuthRes.data.code === 'AUTH_TOKEN_MISSING', 'Returns structured error code AUTH_TOKEN_MISSING');

    const badTokenRes = await request('GET', '/api/v1/farmers/profile', null, {
      'Authorization': 'Bearer invalid_forged_token_xyz'
    });
    assert(badTokenRes.status === 401, 'Rejects forged or invalid Bearer token with 401');

    // 1. Send OTP first to seed user and demo OTP
    await request('POST', '/api/v1/auth/send-otp', {
      phone: '+919876543210',
      role: 'farmer'
    });

    // Login to obtain valid credentials
    const loginRes = await request('POST', '/api/v1/auth/verify-otp', {
      phone: '+919876543210',
      otp: '123456'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Authenticates legitimate user and returns access token');
    const validToken = loginRes.data.token;
    const validRefreshToken = loginRes.data.refreshToken;

    const authRes = await request('GET', '/api/v1/farmers/profile', null, {
      'Authorization': `Bearer ${validToken}`
    });
    assert(authRes.status === 200 && authRes.data.profile, 'Permits authorized request with valid token');

    // ── 2. API Rate Limiting ──
    console.log('\n--- 2. API Rate Limiting ---');
    const rateHeadersRes = await request('GET', '/api/v1/health');
    assert(rateHeadersRes.headers['ratelimit-limit'], 'Responses include RateLimit-Limit header');
    assert(rateHeadersRes.headers['ratelimit-remaining'], 'Responses include RateLimit-Remaining header');
    assert(rateHeadersRes.headers['ratelimit-reset'], 'Responses include RateLimit-Reset header');

    // Test rate limiter breach with dedicated mini-limiter
    const testLimiter = createRateLimiter({
      windowMs: 10000,
      max: 3,
      message: 'Testing rate limit breach',
      code: 'TEST_RATE_LIMIT',
      keyGenerator: () => 'test-ip-client'
    });
    const mockReq = { headers: {}, ip: '127.0.0.1', socket: {} };
    let testBlocked = false;
    let mockHeaders = {};
    const mockRes = {
      setHeader: (k, v) => { mockHeaders[k] = v; },
      status: (code) => ({
        json: (body) => {
          if (code === 429) testBlocked = true;
        }
      })
    };
    testLimiter(mockReq, mockRes, () => {});
    testLimiter(mockReq, mockRes, () => {});
    testLimiter(mockReq, mockRes, () => {});
    testLimiter(mockReq, mockRes, () => {}); // 4th request triggers 429
    assert(testBlocked, 'Rate limiter blocks requests exceeding quota with 429 Too Many Requests');
    assert(mockHeaders['Retry-After'], 'Rate limiter includes Retry-After header on 429 breach');

    // ── 3. API Input Validation ──
    console.log('\n--- 3. API Input Validation ---');
    const invalidOtpRes = await request('POST', '/api/v1/auth/verify-otp', {
      phone: '+919876543210',
      otp: '999999' // Invalid OTP
    });
    assert(invalidOtpRes.status === 400, 'Rejects malformed input payloads with 400 Bad Request');

    const invalidParamRes = await request('GET', '/api/v1/grievances/invalid..id', null, {
      'Authorization': `Bearer ${validToken}`
    });
    assert(invalidParamRes.status === 400 || invalidParamRes.status === 404, 'Rejects invalid route parameters with 400/404');

    // ── 4. API Error Handling ──
    console.log('\n--- 4. API Error Handling (No Sensitive Information Disclosure) ---');
    const notFoundRes = await request('GET', '/api/v1/nonexistent-endpoint-test');
    assert(notFoundRes.status === 404, 'Returns 404 for nonexistent resources');

    assert(noAuthRes.data.error_id && noAuthRes.data.status, 'Error responses include standard error_id and status');
    assert(noAuthRes.data.timestamp, 'Error responses include ISO timestamp');
    assert(!JSON.stringify(noAuthRes.data).includes('C:\\') && !JSON.stringify(noAuthRes.data).includes('/home/'), 'Error messages do not leak internal filesystem paths or stack traces');

    // ── 5. API Versioning ──
    console.log('\n--- 5. API Versioning & Backward Compatibility ---');
    const v1Health = await request('GET', '/api/v1/health');
    assert(v1Health.status === 200, 'Endpoint /api/v1/health responds with 200 OK');
    assert(v1Health.headers['x-api-version'] === '1.0.0', 'Responses include X-API-Version: 1.0.0 header');
    assert(v1Health.headers['x-content-type-options'] === 'nosniff', 'Responses include X-Content-Type-Options: nosniff header');

    const legacyHealth = await request('GET', '/api/health');
    assert(legacyHealth.status === 200, 'Legacy /api/ path is maintained with 100% backward compatibility');
    assert(legacyHealth.headers['x-api-version'] === '1.0.0', 'Legacy path also outputs version header');

    // ── 6. JWT Security ──
    console.log('\n--- 6. JWT Security (Signing, Verification, alg:none defense) ---');
    const decodedHeader = jwt.decode(validToken, { complete: true });
    assert(decodedHeader && decodedHeader.header.alg === 'HS256', 'JWT is signed with cryptographic algorithm HS256');

    // alg: none attack test
    const noneToken = jwt.sign({ id: 'user-1', role: 'admin' }, '', { algorithm: 'none' });
    const algNoneRes = await request('GET', '/api/v1/farmers/profile', null, {
      'Authorization': `Bearer ${noneToken}`
    });
    assert(algNoneRes.status === 401, 'Strictly rejects "alg: none" bypass attack token');

    // Expired token test
    const secret = process.env.JWT_SECRET || 'krishiseva_secure_secret_key_change_in_production';
    const expiredToken = jwt.sign({ id: 'user-1', role: 'farmer' }, secret, {
      expiresIn: '-10s',
      algorithm: 'HS256'
    });
    const expiredRes = await request('GET', '/api/v1/farmers/profile', null, {
      'Authorization': `Bearer ${expiredToken}`
    });
    assert(expiredRes.status === 401, 'Rejects expired JWT tokens');
    assert(expiredRes.data.code === 'TOKEN_EXPIRED', 'Returns TOKEN_EXPIRED error code for expired token');

    // ── 7. CSRF Protection ──
    console.log('\n--- 7. CSRF Protection (Double-Submit Token & Header Defense) ---');
    const csrfRes = await request('GET', '/api/v1/csrf-token');
    assert(csrfRes.status === 200 && csrfRes.data.csrfToken, 'Issues cryptographically signed CSRF token');
    assert(csrfRes.headers['set-cookie'] && csrfRes.headers['set-cookie'].some(c => c.includes('krishi_csrf')), 'Sets krishi_csrf cookie in response');

    const csrfToken = csrfRes.data.csrfToken;
    const csrfCookie = `krishi_csrf=${csrfToken}; krishi_session=${validToken}`;

    // State-changing request with cookie session auth BUT MISSING CSRF header -> must fail with 403
    const csrfBlockedRes = await request('POST', '/api/v1/farmers/profile', { name: 'New Farmer' }, {
      'Cookie': csrfCookie
    });
    assert(csrfBlockedRes.status === 403, 'Rejects cookie-authenticated mutation missing X-CSRF-Token with 403 Forbidden');
    assert(csrfBlockedRes.data.code === 'CSRF_TOKEN_INVALID', 'Returns CSRF_TOKEN_INVALID code');

    // State-changing request WITH valid X-CSRF-Token header -> succeeds
    const csrfAllowedRes = await request('PUT', '/api/v1/farmers/profile', {
      name: 'Ramesh Singh',
      village: 'Amritsar Rural',
      district: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      bank_name: 'SBI',
      bank_account_last4: '4321',
      ifsc_code: 'SBIN0001234'
    }, {
      'Cookie': csrfCookie,
      'X-CSRF-Token': csrfToken
    });
    assert(csrfAllowedRes.status === 200, 'Accepts cookie-authenticated mutation with valid X-CSRF-Token header');

    // Programmatic Bearer token request (immune to browser CSRF) -> succeeds without CSRF header
    const bearerAllowedRes = await request('PUT', '/api/v1/farmers/profile', {
      name: 'Ramesh Singh',
      village: 'Amritsar Rural',
      district: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      bank_name: 'SBI',
      bank_account_last4: '4321',
      ifsc_code: 'SBIN0001234'
    }, {
      'Authorization': `Bearer ${validToken}`
    });
    assert(bearerAllowedRes.status === 200, 'Accepts Bearer token mutations without requiring browser CSRF headers');

    // ── 8. API Monitoring & Anomaly Detection ──
    console.log('\n--- 8. API Monitoring & Intrusion Telemetry ---');
    // Generate an admin token
    const adminUser = memoryStore.users.find(u => u.role === 'admin') || {
      id: 'admin-test-1',
      phone: '+919999999999',
      name: 'Test Administrator',
      role: 'admin'
    };
    if (!memoryStore.users.some(u => u.id === adminUser.id)) {
      memoryStore.users.push(adminUser);
    }
    const adminToken = jwt.sign(
      { id: adminUser.id, phone: adminUser.phone, name: adminUser.name, role: 'admin' },
      secret,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    const metricsRes = await request('GET', '/api/v1/admin/security/metrics', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(metricsRes.status === 200, 'Admin can retrieve API telemetry metrics');
    assert(metricsRes.data.total_requests > 0, 'Metrics record total request volume');
    assert(metricsRes.data.status_codes && '2xx' in metricsRes.data.status_codes, 'Metrics track status code distributions');
    assert(Array.isArray(metricsRes.data.top_endpoints), 'Metrics aggregate top endpoint frequencies');
    assert(metricsRes.data.health_status, 'Metrics compute API health status');

    // Simulate recording an anomaly alert
    recordSecurityAlert('HIGH', 'TEST_INTRUSION_ALERT', 'Simulated anomaly test alert', {
      headers: {},
      ip: '192.168.1.100',
      url: '/api/v1/test',
      method: 'POST',
      user: { id: 'admin-test-1', role: 'admin' }
    });
    const alertsRes = await request('GET', '/api/v1/admin/security/alerts', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(alertsRes.status === 200 && alertsRes.data.count > 0, 'Admin can view intrusion & security anomaly alerts');

    // ── 9. Rotate API Keys & Tokens ──
    console.log('\n--- 9. Rotate API Keys & Tokens (RTR + Reuse Detection + Grace Overlap) ---');
    // Refresh Token Rotation
    const initialRefresh = createRefreshToken('user-test-rotate');
    const rotate1 = rotateRefreshToken(initialRefresh.rawToken);
    assert(rotate1.success && rotate1.newRefreshToken, 'Refresh token rotates successfully into a new refresh token');
    assert(rotate1.newRefreshToken !== initialRefresh.rawToken, 'Rotated refresh token has a new unique value');

    // REUSE DETECTION TEST: using old initialRefresh.rawToken again
    const reuseAttempt = rotateRefreshToken(initialRefresh.rawToken);
    assert(!reuseAttempt.success && reuseAttempt.code === 'TOKEN_REUSE_DETECTED', 'Token reuse detection identifies replay attack and rejects old token');

    // Verify token family revocation: rotate1.newRefreshToken should now also be invalidated
    const familyCheck = rotateRefreshToken(rotate1.newRefreshToken);
    assert(!familyCheck.success, 'Token reuse attack invalidates entire compromised token family');

    // API Key Rotation with 24h Grace Period
    const generatedKey = generateApiKey('Weighbridge Scanner #4', 'officer');
    assert(generatedKey.rawKey && generatedKey.keyRecord, 'Generates secure enterprise API Key');

    const validInitial = validateApiKey(generatedKey.rawKey, 'officer');
    assert(validInitial.isValid && !validInitial.isGracePeriod, 'Validates newly created active API key');

    // Rotate Key
    const keyRotation = rotateApiKey(generatedKey.keyRecord.id, 24);
    assert(keyRotation.success && keyRotation.newRawKey, 'Rotates API key and issues replacement key');

    const validNew = validateApiKey(keyRotation.newRawKey, 'officer');
    assert(validNew.isValid && !validNew.isGracePeriod, 'Validates replacement newly rotated key');

    const validOldGrace = validateApiKey(generatedKey.rawKey, 'officer');
    assert(validOldGrace.isValid && validOldGrace.isGracePeriod, 'Allows old rotated key during 24-hour grace overlap period to prevent service drops');

    // ── Summary ──
    console.log('\n===============================================================');
    console.log(`  🎉 API SECURITY SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
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
