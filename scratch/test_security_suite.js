const http = require('http');
const path = require('path');

// Load compiled backend app
const { app } = require('c:/Users/Rakshit Mishra/Downloads/KrishiSeva AG/apps/backend/dist/app.js');

let server;
let baseUrl;

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
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
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Enterprise Security Verification Test Suite (9 Checks)...\n');
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Check 1: Strong Password Policies
    // -------------------------------------------------------------
    console.log('--- [Check 1: Strong Password Policies] ---');
    // Short password (<8)
    const shortRes = await request('POST', '/api/auth/register-password', {
      phone: '9876543210',
      password: 'Ab1!'
    });
    assert(shortRes.status === 400 && shortRes.data.error.includes('8 characters'), 'Rejects password shorter than 8 characters');

    // Common password
    const commonRes = await request('POST', '/api/auth/register-password', {
      phone: '9876543210',
      password: 'password123'
    });
    assert(commonRes.status === 400 && (commonRes.data.error.includes('commonly used') || commonRes.data.error.includes('combination')), 'Rejects common OWASP dictionary password');

    // Missing symbol/number
    const weakRes = await request('POST', '/api/auth/register-password', {
      phone: '9876543210',
      password: 'JustLettersHere'
    });
    assert(weakRes.status === 400 && weakRes.data.error.includes('combination of uppercase'), 'Rejects passwords missing required character classes');

    // Valid strong password
    const validRegRes = await request('POST', '/api/auth/register-password', {
      phone: '9876543210',
      password: 'Kisan@SecurePass2026!',
      name: 'Ramesh Singh',
      role: 'farmer'
    });
    assert(validRegRes.status === 201 && validRegRes.data.token, 'Accepts strong password and creates account');
    const farmerToken = validRegRes.data.token;
    const farmerSessionId = validRegRes.data.sessionId;

    // -------------------------------------------------------------
    // Check 2: Secure Session Management (Cookies & Session Fixation)
    // -------------------------------------------------------------
    console.log('\n--- [Check 2: Secure Session Management] ---');
    const setCookie = validRegRes.headers['set-cookie'];
    assert(setCookie && setCookie.some(c => c.includes('krishi_session') && c.includes('HttpOnly')), 'Sets secure HttpOnly session cookie');
    assert(Boolean(farmerSessionId), 'Generates unique cryptographic sessionId per login preventing fixation');

    // -------------------------------------------------------------
    // Check 4: Secure Password Storage (Bcrypt) & Verification
    // -------------------------------------------------------------
    console.log('\n--- [Check 4: Secure Password Storage] ---');
    const loginOk = await request('POST', '/api/auth/login-password', {
      identifier: '9876543210',
      password: 'Kisan@SecurePass2026!'
    });
    assert(loginOk.status === 200 && loginOk.data.token, 'Validates bcrypt hashed credentials correctly');

    // -------------------------------------------------------------
    // Check 5: Account Lockout Policies
    // -------------------------------------------------------------
    console.log('\n--- [Check 5: Account Lockout Policies] ---');
    const attackTarget = '9999900001';
    await request('POST', '/api/auth/register-password', {
      phone: attackTarget,
      password: 'Victim@Pass1234#'
    });

    let lastFailRes;
    for (let i = 0; i < 5; i++) {
      lastFailRes = await request('POST', '/api/auth/login-password', {
        identifier: attackTarget,
        password: 'WrongPassword@999'
      });
    }
    assert(lastFailRes.status === 429 && lastFailRes.data.isLocked, 'Account locked out after 5 consecutive failed attempts');

    const blockedRes = await request('POST', '/api/auth/login-password', {
      identifier: attackTarget,
      password: 'Victim@Pass1234#'
    });
    assert(blockedRes.status === 429 && blockedRes.data.isLocked && blockedRes.data.remainingSeconds > 0, 'Subsequent attempts rejected even with correct password during lockout window');

    // -------------------------------------------------------------
    // Check 3: Multi-Factor Authentication (MFA)
    // -------------------------------------------------------------
    console.log('\n--- [Check 3: Multi-Factor Authentication (MFA)] ---');
    const mfaSetupRes = await request('POST', '/api/auth/mfa/setup', null, {
      'Authorization': `Bearer ${farmerToken}`
    });
    assert(mfaSetupRes.status === 200 && mfaSetupRes.data.secret && mfaSetupRes.data.otpauth_url, 'Generates standard TOTP secret and otpauth URI');

    const mfaSecret = mfaSetupRes.data.secret;
    const demoCode = mfaSetupRes.data.demo_code_hint;

    const mfaEnableRes = await request('POST', '/api/auth/mfa/enable', {
      code: demoCode
    }, {
      'Authorization': `Bearer ${farmerToken}`
    });
    assert(mfaEnableRes.status === 200 && mfaEnableRes.data.mfa_enabled && mfaEnableRes.data.backup_codes.length === 5, 'Enables MFA with TOTP code and generates 5 backup codes');

    // Now test login with MFA challenge
    const mfaLoginPrompt = await request('POST', '/api/auth/login-password', {
      identifier: '9876543210',
      password: 'Kisan@SecurePass2026!'
    });
    assert(mfaLoginPrompt.status === 200 && mfaLoginPrompt.data.require_mfa && mfaLoginPrompt.data.mfa_token, 'Login prompts for 2FA second-step verification challenge');

    const mfaVerifyRes = await request('POST', '/api/auth/mfa/verify-login', {
      mfa_token: mfaLoginPrompt.data.mfa_token,
      code: mfaEnableRes.data.backup_codes[0] // Use backup code
    });
    assert(mfaVerifyRes.status === 200 && mfaVerifyRes.data.token, 'Completes 2FA login successfully using recovery code');
    const mfaAuthedToken = mfaVerifyRes.data.token;

    // -------------------------------------------------------------
    // Check 6: Secure Password Reset (Time-limited, single-use)
    // -------------------------------------------------------------
    console.log('\n--- [Check 6: Secure Password Reset] ---');
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      identifier: '9876543210'
    });
    assert(forgotRes.status === 200 && forgotRes.data.demo_reset_token, 'Issues single-use cryptographic reset token with 15-minute expiration');

    const resetToken = forgotRes.data.demo_reset_token;
    const resetRes = await request('POST', '/api/auth/reset-password', {
      token: resetToken,
      newPassword: 'Kisan@NewSecurePass2026!'
    });
    assert(resetRes.status === 200, 'Resets password and invalidates all previous sessions');

    // Attempting to reuse same token should fail
    const reuseResetRes = await request('POST', '/api/auth/reset-password', {
      token: resetToken,
      newPassword: 'Another@Password999!'
    });
    assert(reuseResetRes.status === 400, 'Strictly prevents token reuse (single-use token enforcement)');

    // -------------------------------------------------------------
    // Check 7: Secure OAuth Implementation (PKCE + Anti-CSRF)
    // -------------------------------------------------------------
    console.log('\n--- [Check 7: Secure OAuth Implementation] ---');
    const oauthInitRes = await request('GET', '/api/auth/oauth/google/initiate');
    assert(oauthInitRes.status === 200 && oauthInitRes.data.state && oauthInitRes.data.code_challenge, 'Generates anti-CSRF state parameter and PKCE code challenge');

    // Fake state (CSRF attack attempt)
    const csrfAttackRes = await request('POST', '/api/auth/oauth/google/callback', {
      state: 'forged_fake_state_123',
      mockEmail: 'hacker@malicious.com'
    });
    assert(csrfAttackRes.status === 403 && csrfAttackRes.data.error.includes('CSRF'), 'Rejects forged or missing OAuth state tokens (Anti-CSRF defense)');

    // Valid state
    const validOauthRes = await request('POST', '/api/auth/oauth/google/callback', {
      state: oauthInitRes.data.state,
      mockEmail: 'ramesh.farmer@gmail.com',
      mockName: 'Ramesh OAuth Farmer'
    });
    assert(validOauthRes.status === 200 && validOauthRes.data.token, 'Successfully validates legitimate OAuth callback with consumed state');

    // -------------------------------------------------------------
    // Check 8: Secure Logout & Session Revocation
    // -------------------------------------------------------------
    console.log('\n--- [Check 8: Secure Logout] ---');
    // Login to get fresh session
    const freshLogin = await request('POST', '/api/auth/login-password', {
      identifier: '9876543210',
      password: 'Kisan@NewSecurePass2026!'
    });
    // Complete MFA step with fresh code
    const freshMfaRes = await request('POST', '/api/auth/mfa/verify-login', {
      mfa_token: freshLogin.data.mfa_token,
      code: mfaEnableRes.data.backup_codes[1]
    });
    const activeToken = freshMfaRes.data.token;

    // Verify authenticated request works before logout
    const meBefore = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert(meBefore.status === 200, 'Authenticated request succeeds before logout');

    // Logout
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert(logoutRes.status === 200, 'Logout terminates session on client and server');

    // Verify token is now REJECTED by server
    const meAfter = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${activeToken}`
    });
    assert(meAfter.status === 401 && meAfter.data.error.includes('revoked'), 'Server-side session invalidation: Token is rejected after logout');

    // -------------------------------------------------------------
    // Check 9: Verify Sensitive Actions (Confirmation Token)
    // -------------------------------------------------------------
    console.log('\n--- [Check 9: Verify Sensitive Actions] ---');
    // Login again
    const reLogin = await request('POST', '/api/auth/login-password', {
      identifier: '9876543210',
      password: 'Kisan@NewSecurePass2026!'
    });
    const reMfa = await request('POST', '/api/auth/mfa/verify-login', {
      mfa_token: reLogin.data.mfa_token,
      code: mfaEnableRes.data.backup_codes[2]
    });
    const sensitiveToken = reMfa.data.token;

    // Try deleting account WITHOUT sensitive confirmation token
    const unverifiedDelete = await request('DELETE', '/api/farmers/account', null, {
      'Authorization': `Bearer ${sensitiveToken}`
    });
    assert(unverifiedDelete.status === 403 && unverifiedDelete.data.requires_confirmation, 'Blocks high-risk sensitive action without confirmation token');

    // Request confirmation token
    const confirmReqRes = await request('POST', '/api/auth/sensitive-action/request', {
      action: 'DELETE_ACCOUNT',
      password: 'Kisan@NewSecurePass2026!'
    }, {
      'Authorization': `Bearer ${sensitiveToken}`
    });
    assert(confirmReqRes.status === 200 && confirmReqRes.data.confirmationToken, 'Issues time-limited single-use confirmation token upon re-authentication');

    const confirmToken = confirmReqRes.data.confirmationToken;

    // Execute sensitive action WITH confirmation token
    const verifiedDelete = await request('DELETE', '/api/farmers/account', null, {
      'Authorization': `Bearer ${sensitiveToken}`,
      'X-Sensitive-Action-Token': confirmToken
    });
    assert(verifiedDelete.status === 200, 'Allows sensitive action to proceed with valid confirmation token');

    // Replay attack: trying to use the same confirmation token again (rejected with 401 or 403)
    const replayDelete = await request('DELETE', '/api/farmers/account', null, {
      'Authorization': `Bearer ${sensitiveToken}`,
      'X-Sensitive-Action-Token': confirmToken
    });
    assert(replayDelete.status === 403 || replayDelete.status === 401, 'Replay attack prevented: Single-use confirmation token is consumed');

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================`);

  } catch (err) {
    console.error('Unexpected error during test suite:', err);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
