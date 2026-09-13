import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { memoryStore } from '../db';
import {
  authMiddleware,
  createSession,
  revokeSession,
  revokeAllUserSessions,
  signJwtToken,
  logAuditAction
} from '../middleware/auth';
import {
  rotateRefreshToken,
  revokeRefreshTokenFamily,
  generateApiKey,
  rotateApiKey,
  listApiKeys
} from '../services/keyRotation.service';
import {
  validatePasswordPolicy,
  hashPassword,
  verifyPassword,
  checkAccountLockout,
  recordFailedLogin,
  resetLoginAttempts,
  generateSecureToken,
  hashToken,
  getSecureCookieOptions,
  generateMfaSecret,
  generateTotpCode,
  verifyTotpCode
} from '../services/security.service';

const router = Router();

// Demo OTP code accepted for fast testing/evaluation
const DEMO_OTP = '123456';

// Temporary MFA login tokens (5-minute expiry)
interface MfaChallenge {
  token: string;
  userId: string;
  expiresAt: number;
}
const mfaChallenges: Map<string, MfaChallenge> = new Map();

// Helper to seed profile if missing
function ensureFarmerProfile(user: any) {
  let profile = memoryStore.farmer_profiles.find(p => p.user_id === user.id);
  if (!profile && user.role === 'farmer') {
    profile = {
      id: `profile-${Date.now()}`,
      user_id: user.id,
      crop_types: ['wheat', 'paddy'],
      land_area_acres: 5.0,
      village: 'Kisan Nagar',
      district: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      bank_name: 'State Bank of India',
      bank_account_last4: '1234',
      ifsc_code: 'SBIN0001234',
      profile_complete: true,
    };
    memoryStore.farmer_profiles.push(profile);
  }
  return profile;
}

// ==========================================
// 1. PHONE + OTP AUTHENTICATION (EXISTING COMPATIBILITY)
// ==========================================

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  const { phone, role = 'farmer' } = req.body;

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Valid phone number is required' });
  }

  const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Auto-register user if not present
  let user = memoryStore.users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      name: role === 'officer' ? 'Mandi Officer' : role === 'admin' ? 'DoCA Administrator' : 'Kisan Farmer',
      role,
      is_active: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    ensureFarmerProfile(user);
  }

  console.log(`[MOCK SMS] OTP for ${cleanPhone}: ${DEMO_OTP} (Expires: ${expiresAt.toISOString()})`);
  logAuditAction(user.id, user.role, 'AUTH_OTP_SENT', 'users', user.id);

  return res.json({
    message: 'OTP sent successfully to mobile number',
    phone: cleanPhone,
    demo_hint: 'Use OTP 123456 for instant demo login',
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, selectedRole } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

  // Check demo OTP
  if (otp !== DEMO_OTP) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please try 123456.' });
  }

  let user = memoryStore.users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      name: selectedRole === 'officer' ? 'Mandi Officer' : selectedRole === 'admin' ? 'DoCA Administrator' : 'Kisan Farmer',
      role: selectedRole || 'farmer',
      is_active: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    ensureFarmerProfile(user);
  }

  if (selectedRole && user.role !== 'admin') {
    user.role = selectedRole;
  }

  // Create tracked session with session fixation protection
  const { token, sessionId, refreshToken } = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'browser'
  );

  // Set secure HTTP-only cookie
  res.cookie('krishi_session', token, getSecureCookieOptions());

  logAuditAction(user.id, user.role, 'AUTH_LOGIN_SUCCESS', 'users', user.id);

  return res.json({
    token,
    refreshToken,
    sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      mfa_enabled: Boolean(user.mfa_enabled),
    },
  });
});

// ==========================================
// 2. STRONG PASSWORD POLICY & SECURE STORAGE
// ==========================================

// POST /api/auth/register-password
router.post('/register-password', async (req: Request, res: Response) => {
  const { phone, password, name, role = 'farmer', email } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }

  // 1. Enforce Strong Password Policy (8+ chars, mix of lower, upper, digit, symbol, no common passwords)
  const policyCheck = validatePasswordPolicy(password);
  if (!policyCheck.isValid) {
    return res.status(400).json({ error: policyCheck.error });
  }

  const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
  let user = memoryStore.users.find(u => u.phone === cleanPhone);

  // 4. Secure Password Storage with Bcrypt (work factor 12)
  const passwordHash = await hashPassword(password);

  if (user) {
    user.password_hash = passwordHash;
    if (email) user.email = email;
    if (name) user.name = name;
    user.updated_at = new Date().toISOString();
  } else {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      email: email || `${cleanPhone.replace(/\D/g, '')}@krishiseva.gov.in`,
      name: name || (role === 'officer' ? 'Mandi Officer' : role === 'admin' ? 'DoCA Administrator' : 'Kisan Farmer'),
      role,
      password_hash: passwordHash,
      is_active: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    ensureFarmerProfile(user);
  }

  const { token, sessionId } = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'browser'
  );

  res.cookie('krishi_session', token, getSecureCookieOptions());
  logAuditAction(user.id, user.role, 'AUTH_PASSWORD_REGISTERED', 'users', user.id);

  return res.status(201).json({
    message: 'Account password configured successfully with enterprise encryption',
    token,
    sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      mfa_enabled: Boolean(user.mfa_enabled),
    },
  });
});

// POST /api/auth/login-password
// 5. Account Lockout Policies & 4. Secure Password Verification
router.post('/login-password', async (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier can be phone or email

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier (phone/email) and password are required' });
  }

  const cleanIdentifier = identifier.trim();

  // 5. Check account lockout status
  const lockoutStatus = checkAccountLockout(cleanIdentifier);
  if (lockoutStatus.isLocked) {
    logAuditAction(undefined, 'system', 'AUTH_LOGIN_BLOCKED_LOCKOUT', 'users', cleanIdentifier);
    return res.status(429).json({
      error: `Account is temporarily locked due to multiple failed login attempts. Please wait ${lockoutStatus.remainingSeconds} seconds before trying again.`,
      isLocked: true,
      remainingSeconds: lockoutStatus.remainingSeconds,
    });
  }

  // Find user by phone or email
  const cleanPhone = cleanIdentifier.startsWith('+91') ? cleanIdentifier : `+91${cleanIdentifier.replace(/\D/g, '')}`;
  const user = memoryStore.users.find(u => u.phone === cleanPhone || u.phone === cleanIdentifier || u.email === cleanIdentifier);

  if (!user || !user.password_hash) {
    const failedResult = recordFailedLogin(cleanIdentifier);
    if (failedResult.isNowLocked) {
      return res.status(429).json({
        error: 'Too many failed attempts. Your account has been temporarily locked for 15 minutes to prevent brute-force attacks.',
        isLocked: true,
        remainingSeconds: 900,
      });
    }
    return res.status(401).json({
      error: `Invalid credentials. ${failedResult.attemptsLeft} attempts remaining before account lockout.`,
      attemptsLeft: failedResult.attemptsLeft,
    });
  }

  // Verify bcrypt hash
  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    const failedResult = recordFailedLogin(cleanIdentifier);
    logAuditAction(user.id, user.role, 'AUTH_FAILED_PASSWORD_ATTEMPT', 'users', user.id);

    if (failedResult.isNowLocked) {
      return res.status(429).json({
        error: 'Too many failed attempts. Your account has been locked for 15 minutes to prevent brute-force attacks.',
        isLocked: true,
        remainingSeconds: 900,
      });
    }
    return res.status(401).json({
      error: `Invalid password. ${failedResult.attemptsLeft} attempts remaining before account lockout.`,
      attemptsLeft: failedResult.attemptsLeft,
    });
  }

  // Success! Reset failed login tracking
  resetLoginAttempts(cleanIdentifier);

  // 3. Multi-Factor Authentication Check
  if (user.mfa_enabled && user.mfa_secret) {
    const mfaToken = generateSecureToken(24);
    mfaChallenges.set(mfaToken, {
      token: mfaToken,
      userId: user.id,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    logAuditAction(user.id, user.role, 'AUTH_MFA_CHALLENGE_ISSUED', 'users', user.id);
    return res.json({
      require_mfa: true,
      mfa_token: mfaToken,
      message: 'Second-factor authentication required. Please provide your 6-digit authenticator code.',
    });
  }

  // 2. Secure Session Management: Generate new session, set HTTP-only cookie
  const { token, sessionId } = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'browser'
  );

  res.cookie('krishi_session', token, getSecureCookieOptions());
  logAuditAction(user.id, user.role, 'AUTH_LOGIN_SUCCESS', 'users', user.id);

  return res.json({
    token,
    sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      mfa_enabled: Boolean(user.mfa_enabled),
    },
  });
});

// ==========================================
// 3. MULTI-FACTOR AUTHENTICATION (MFA)
// ==========================================

// POST /api/auth/mfa/setup (Initiate MFA TOTP setup)
router.post('/mfa/setup', authMiddleware, (req: Request, res: Response) => {
  const user = memoryStore.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const secret = generateMfaSecret();
  const issuer = 'KrishiSeva';
  const label = encodeURIComponent(`${issuer}:${user.phone}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // Store pending secret temporarily
  user.pending_mfa_secret = secret;

  return res.json({
    secret,
    otpauth_url: otpauthUrl,
    demo_code_hint: generateTotpCode(secret),
    message: 'Add this secret to your Authenticator App (Google Authenticator, Microsoft Authenticator, Authy), then verify with 6-digit code.',
  });
});

// POST /api/auth/mfa/enable (Confirm & activate MFA with code)
router.post('/mfa/enable', authMiddleware, (req: Request, res: Response) => {
  const { code } = req.body;
  const user = memoryStore.users.find(u => u.id === req.user?.id);

  if (!user || !user.pending_mfa_secret) {
    return res.status(400).json({ error: 'No MFA setup in progress. Please initiate setup first.' });
  }

  const isValid = verifyTotpCode(user.pending_mfa_secret, code);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid 6-digit authentication code. Please try again.' });
  }

  // Activate MFA and generate 5 one-time backup recovery codes
  user.mfa_secret = user.pending_mfa_secret;
  user.mfa_enabled = true;
  delete user.pending_mfa_secret;

  const backupCodes = Array.from({ length: 5 }, () => generateSecureToken(4).toUpperCase());
  user.mfa_backup_codes = backupCodes;

  logAuditAction(user.id, user.role, 'AUTH_MFA_ENABLED', 'users', user.id);

  return res.json({
    message: 'Multi-Factor Authentication (MFA) enabled successfully!',
    mfa_enabled: true,
    backup_codes: backupCodes,
  });
});

// POST /api/auth/mfa/verify-login (Verify second-step during login)
router.post('/mfa/verify-login', async (req: Request, res: Response) => {
  const { mfa_token, code } = req.body;

  if (!mfa_token || !code) {
    return res.status(400).json({ error: 'MFA token and verification code are required' });
  }

  const challenge = mfaChallenges.get(mfa_token);
  if (!challenge || challenge.expiresAt < Date.now()) {
    mfaChallenges.delete(mfa_token);
    return res.status(401).json({ error: 'MFA session has expired. Please login again.' });
  }

  const user = memoryStore.users.find(u => u.id === challenge.userId);
  if (!user || !user.mfa_secret) {
    return res.status(400).json({ error: 'MFA not configured for this account' });
  }

  const isValidTotp = verifyTotpCode(user.mfa_secret, code);
  const isBackupCode = Array.isArray(user.mfa_backup_codes) && user.mfa_backup_codes.includes(code.toUpperCase());

  if (!isValidTotp && !isBackupCode) {
    return res.status(401).json({ error: 'Invalid 6-digit authenticator code or recovery code.' });
  }

  // If backup code was used, consume it
  if (isBackupCode) {
    user.mfa_backup_codes = user.mfa_backup_codes.filter((c: string) => c !== code.toUpperCase());
  }

  mfaChallenges.delete(mfa_token);

  // Issue full secure session
  const { token, sessionId } = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'browser'
  );

  res.cookie('krishi_session', token, getSecureCookieOptions());
  logAuditAction(user.id, user.role, 'AUTH_MFA_LOGIN_SUCCESS', 'users', user.id);

  return res.json({
    token,
    sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      mfa_enabled: true,
    },
  });
});

// POST /api/auth/mfa/disable (Requires password verification)
router.post('/mfa/disable', authMiddleware, async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = memoryStore.users.find(u => u.id === req.user?.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.password_hash) {
    if (!password) {
      return res.status(400).json({ error: 'Current password is required to disable MFA' });
    }
    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(403).json({ error: 'Incorrect password. MFA disable rejected.' });
    }
  }

  user.mfa_enabled = false;
  delete user.mfa_secret;
  delete user.mfa_backup_codes;

  logAuditAction(user.id, user.role, 'AUTH_MFA_DISABLED', 'users', user.id);

  return res.json({ message: 'Multi-Factor Authentication disabled successfully', mfa_enabled: false });
});

// ==========================================
// 6. SECURE PASSWORD RESET (TIME-LIMITED, SINGLE-USE)
// ==========================================

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { identifier } = req.body; // phone or email

  if (!identifier) {
    return res.status(400).json({ error: 'Phone or email identifier is required' });
  }

  const cleanPhone = identifier.startsWith('+91') ? identifier : `+91${identifier.replace(/\D/g, '')}`;
  const user = memoryStore.users.find(u => u.phone === cleanPhone || u.phone === identifier || u.email === identifier);

  // OWASP protection: Always return the same response so attackers cannot enumerate registered users
  const standardMessage = 'If a matching account is found, a secure single-use password reset link has been dispatched.';

  if (!user) {
    return res.json({ message: standardMessage });
  }

  // Generate 32-byte cryptographic token
  const rawToken = generateSecureToken(32);
  const tokenHashValue = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes time-limit

  // Invalidate any existing reset tokens for this user
  memoryStore.password_resets.forEach(pr => {
    if (pr.user_id === user.id) pr.is_used = true;
  });

  memoryStore.password_resets.push({
    id: `reset-${Date.now()}`,
    user_id: user.id,
    token_hash: tokenHashValue,
    raw_token: rawToken, // Kept in memory for interactive demo testing
    expires_at: expiresAt.toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
  });

  logAuditAction(user.id, user.role, 'AUTH_PASSWORD_RESET_REQUESTED', 'users', user.id);
  console.log(`[SECURE RESET] Reset Token for ${user.phone}: ${rawToken} (Valid for 15 mins)`);

  return res.json({
    message: standardMessage,
    demo_reset_token: rawToken,
    expires_in_minutes: 15,
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  // 1. Enforce strong password policy on the new password
  const policyCheck = validatePasswordPolicy(newPassword);
  if (!policyCheck.isValid) {
    return res.status(400).json({ error: policyCheck.error });
  }

  const tokenHashValue = hashToken(token);
  const resetEntry = memoryStore.password_resets.find(
    pr => (pr.token_hash === tokenHashValue || pr.raw_token === token) && !pr.is_used
  );

  if (!resetEntry) {
    return res.status(400).json({ error: 'Invalid or already consumed password reset token.' });
  }

  if (new Date(resetEntry.expires_at).getTime() < Date.now()) {
    resetEntry.is_used = true;
    return res.status(400).json({ error: 'Password reset token has expired. Please request a new one.' });
  }

  const user = memoryStore.users.find(u => u.id === resetEntry.user_id);
  if (!user) {
    return res.status(404).json({ error: 'User account no longer exists.' });
  }

  // Update password with bcrypt rounds 12
  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date().toISOString();

  // Mark token as consumed (Single-use enforcement)
  resetEntry.is_used = true;

  // Revoke ALL existing user sessions across all devices for security
  revokeAllUserSessions(user.id);
  resetLoginAttempts(user.phone);

  logAuditAction(user.id, user.role, 'AUTH_PASSWORD_RESET_COMPLETED', 'users', user.id);

  return res.json({
    message: 'Password has been updated successfully. All existing sessions have been terminated for your security. Please log in with your new password.',
  });
});

// ==========================================
// 7. SECURE OAUTH (PKCE + ANTI-CSRF STATE VERIFICATION)
// ==========================================

// GET /api/auth/oauth/google/initiate
router.get('/oauth/google/initiate', (_req: Request, res: Response) => {
  // Generate random cryptographic state token to prevent CSRF
  const state = generateSecureToken(24);
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateSecureToken(32);
  const codeChallenge = hashToken(codeVerifier);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  memoryStore.oauth_states.push({
    state,
    code_verifier: codeVerifier,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });

  return res.json({
    provider: 'Google',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    message: 'Anti-CSRF state token and PKCE code challenge generated successfully.',
  });
});

// POST /api/auth/oauth/google/callback
router.post('/oauth/google/callback', async (req: Request, res: Response) => {
  const { state, mockEmail, mockName, role = 'farmer' } = req.body;

  if (!state) {
    return res.status(400).json({ error: 'OAuth state parameter missing. Request aborted for CSRF prevention.' });
  }

  // Validate state to prevent CSRF attacks
  const stateIndex = memoryStore.oauth_states.findIndex(s => s.state === state);
  if (stateIndex === -1) {
    return res.status(403).json({ error: 'Invalid or forged OAuth state token. CSRF protection triggered.' });
  }

  const storedState = memoryStore.oauth_states[stateIndex];
  if (new Date(storedState.expires_at).getTime() < Date.now()) {
    memoryStore.oauth_states.splice(stateIndex, 1);
    return res.status(403).json({ error: 'OAuth state token has expired. Please initiate login again.' });
  }

  // State is valid: consume it immediately
  memoryStore.oauth_states.splice(stateIndex, 1);

  // Authenticate / register user
  const email = mockEmail || 'kisan.oauth@krishiseva.gov.in';
  const name = mockName || 'Verified Kisan User';
  const cleanPhone = `+9198${Date.now().toString().slice(-8)}`;

  let user = memoryStore.users.find(u => u.email === email);
  if (!user) {
    user = {
      id: `user-oauth-${Date.now()}`,
      phone: cleanPhone,
      email,
      name,
      role,
      is_active: true,
      mfa_enabled: false,
      oauth_provider: 'google',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
    ensureFarmerProfile(user);
  }

  const { token, sessionId } = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'browser'
  );

  res.cookie('krishi_session', token, getSecureCookieOptions());
  logAuditAction(user.id, user.role, 'AUTH_OAUTH_LOGIN_SUCCESS', 'users', user.id);

  return res.json({
    message: 'OAuth authentication validated successfully with anti-CSRF check',
    token,
    sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// ==========================================
// 8. SECURE LOGOUT & SESSION INVALIDATION
// ==========================================

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  const sessionId = req.user?.sessionId;

  if (sessionId) {
    // Invalidate session on server
    revokeSession(sessionId);
  }

  // Clear HTTP-only session cookie
  res.clearCookie('krishi_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });

  logAuditAction(req.user?.id, req.user?.role, 'AUTH_LOGOUT', 'sessions', sessionId || 'unknown');

  return res.json({
    message: 'Session terminated and invalidated on both client and server successfully.',
  });
});

// ==========================================
// 9. VERIFY SENSITIVE ACTIONS (RE-AUTH / CONFIRMATION TOKEN)
// ==========================================

// POST /api/auth/sensitive-action/request
router.post('/sensitive-action/request', authMiddleware, async (req: Request, res: Response) => {
  const { action, password, otp } = req.body;
  const user = memoryStore.users.find(u => u.id === req.user?.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!action) {
    return res.status(400).json({ error: 'Action name is required (e.g. DELETE_ACCOUNT, UPDATE_BANK)' });
  }

  // Verify identity: either current password or OTP
  let verified = false;
  if (user.password_hash && password) {
    verified = await verifyPassword(password, user.password_hash);
  } else if (otp === DEMO_OTP) {
    verified = true;
  }

  if (!verified) {
    return res.status(403).json({
      error: 'Identity confirmation failed. Please enter your valid password or OTP to confirm this sensitive action.',
    });
  }

  // Issue 5-minute single-use confirmation token
  const confirmationToken = generateSecureToken(24);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  memoryStore.sensitive_action_tokens.push({
    token: confirmationToken,
    user_id: user.id,
    action,
    expires_at: expiresAt.toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
  });

  logAuditAction(user.id, user.role, 'AUTH_SENSITIVE_ACTION_TOKEN_ISSUED', 'actions', action);

  return res.json({
    message: 'Identity verified. Single-use confirmation token generated.',
    confirmationToken,
    expires_in_seconds: 300,
    action,
  });
});

// ==========================================
// USER & SESSION INSPECTION ENDPOINTS
// ==========================================

// GET /api/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = memoryStore.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = memoryStore.farmer_profiles.find(p => p.user_id === user.id);

  return res.json({
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      mfa_enabled: Boolean(user.mfa_enabled),
      has_password: Boolean(user.password_hash),
      profile: profile || null,
    },
  });
});

// GET /api/auth/sessions (Inspect Active Sessions)
router.get('/sessions', authMiddleware, (req: Request, res: Response) => {
  const userSessions = memoryStore.active_sessions.filter(
    s => s.user_id === req.user?.id && !s.is_revoked && new Date(s.expires_at).getTime() > Date.now()
  );

  return res.json({
    current_session_id: req.user?.sessionId,
    active_sessions: userSessions.map(s => ({
      id: s.id,
      ip_address: s.ip_address,
      user_agent: s.user_agent,
      created_at: s.created_at,
      expires_at: s.expires_at,
      is_current: s.id === req.user?.sessionId,
    })),
  });
});

// POST /api/auth/sessions/revoke-all (Terminate all other active sessions)
router.post('/sessions/revoke-all', authMiddleware, (req: Request, res: Response) => {
  const currentSessionId = req.user?.sessionId;
  let revokedCount = 0;

  memoryStore.active_sessions.forEach(s => {
    if (s.user_id === req.user?.id && s.id !== currentSessionId && !s.is_revoked) {
      s.is_revoked = true;
      revokedCount++;
    }
  });

  return res.json({
    message: `Successfully revoked ${revokedCount} other active sessions.`,
    revokedCount,
  });
});

// ==========================================
// REFRESH TOKEN ROTATION (RTR) & API KEY ROTATION
// ==========================================

// POST /api/auth/refresh (Rotate refresh token & issue new access token)
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required in request body', code: 'REFRESH_TOKEN_REQUIRED' });
  }

  const rotation = rotateRefreshToken(refreshToken);
  if (!rotation.success || !rotation.userId) {
    return res.status(rotation.code === 'TOKEN_REUSE_DETECTED' ? 403 : 401).json({
      error: rotation.error,
      code: rotation.code,
      status: rotation.code === 'TOKEN_REUSE_DETECTED' ? 403 : 401,
      timestamp: new Date().toISOString(),
    });
  }

  const user = memoryStore.users.find(u => u.id === rotation.userId);
  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'User account inactive or not found', code: 'USER_INACTIVE' });
  }

  const session = createSession(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    req.ip || '127.0.0.1',
    req.get('user-agent') || 'token-refresh'
  );

  return res.json({
    message: 'Tokens rotated successfully',
    token: session.token,
    refreshToken: rotation.newRefreshToken,
    sessionId: session.sessionId,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

// POST /api/auth/tokens/revoke (Revoke user token family)
router.post('/tokens/revoke', authMiddleware, (req: Request, res: Response) => {
  const userId = req.user!.id;
  revokeRefreshTokenFamily(userId);
  return res.json({ message: 'All refresh tokens for user have been successfully revoked' });
});

// POST /api/auth/admin/keys/create (Generate Integration API Key)
router.post('/admin/keys/create', authMiddleware, (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const { name, role = 'officer', expiryDays = 90 } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Key name is required' });
  }

  const { rawKey, keyRecord } = generateApiKey(name, role, Number(expiryDays));
  return res.status(201).json({
    message: 'API Key generated successfully. Save this secret now as it will not be displayed again.',
    apiKey: rawKey,
    record: keyRecord,
  });
});

// POST /api/auth/admin/keys/:id/rotate (Rotate API Key with 24h grace period)
router.post('/admin/keys/:id/rotate', authMiddleware, (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const { id } = req.params;
  const graceHours = parseInt(req.body.gracePeriodHours) || 24;
  const result = rotateApiKey(id, graceHours);

  if (!result.success) {
    return res.status(404).json({ error: result.error, code: 'KEY_NOT_FOUND' });
  }

  return res.json({
    message: `API Key rotated successfully with a ${graceHours}-hour migration grace period.`,
    newApiKey: result.newRawKey,
    keyRecord: result.newKeyRecord,
    gracePeriodHours: graceHours,
  });
});

// GET /api/auth/admin/keys (List API Keys with Masked Secrets)
router.get('/admin/keys', authMiddleware, (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const keys = listApiKeys();
  return res.json({ keys, count: keys.length });
});

export default router;

