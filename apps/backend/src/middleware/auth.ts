import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../db';
import { generateSecureToken } from '../services/security.service';
import { createRefreshToken, validateApiKey } from '../services/keyRotation.service';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name: string;
  role: 'farmer' | 'officer' | 'admin';
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'krishiseva_secure_secret_key_change_in_production';

const JWT_SIGN_OPTIONS: jwt.SignOptions = {
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'krishiseva.gov.in',
  audience: 'krishiseva-app',
};

/**
 * 2. Secure Session Management & Session Fixation Protection
 * Issues fresh cryptographic sessionId per login and stores in active_sessions
 */
export function createSession(
  user: { id: string; phone: string; name: string; role: 'farmer' | 'officer' | 'admin' },
  ip: string = '127.0.0.1',
  userAgent: string = 'browser'
): { token: string; sessionId: string; refreshToken: string } {
  const sessionId = `sess_${generateSecureToken(16)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const sessionRecord = {
    id: sessionId,
    user_id: user.id,
    ip_address: ip,
    user_agent: userAgent,
    is_revoked: false,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  memoryStore.active_sessions.unshift(sessionRecord);

  // 6. Hardened JWT Signing with strict algorithm, issuer, and audience
  const token = jwt.sign(
    { id: user.id, phone: user.phone, name: user.name, role: user.role, sessionId },
    JWT_SECRET,
    JWT_SIGN_OPTIONS
  );

  // 9. Generate fresh refresh token for token rotation
  const { rawToken: refreshToken } = createRefreshToken(user.id);

  return { token, sessionId, refreshToken };
}

export function revokeSession(sessionId: string): void {
  const session = memoryStore.active_sessions.find(s => s.id === sessionId);
  if (session) {
    session.is_revoked = true;
  }
}

export function revokeAllUserSessions(userId: string): void {
  memoryStore.active_sessions.forEach(s => {
    if (s.user_id === userId) {
      s.is_revoked = true;
    }
  });
}

export function signJwtToken(user: AuthenticatedUser): string {
  const { token } = createSession(user);
  return token;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Bearer token header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.krishi_session) {
    // 2. Check HTTP-Only Cookie fallback
    token = req.cookies.krishi_session;
  }

  if (!token) {
    const errorId = `err_auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return res.status(401).json({
      error: 'Authentication token missing or invalid',
      code: 'AUTH_TOKEN_MISSING',
      error_id: errorId,
      status: 401,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // 6. Hardened JWT Verification: Enforce HS256 algorithm to prevent alg:none downgrade
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as AuthenticatedUser;

    // Check server-side session revocation (Secure Logout check)
    if (decoded.sessionId) {
      const activeSession = memoryStore.active_sessions.find(s => s.id === decoded.sessionId);
      if (activeSession && activeSession.is_revoked) {
        const errorId = `err_sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        return res.status(401).json({
          error: 'Session has been revoked/logged out. Please login again.',
          code: 'SESSION_REVOKED',
          error_id: errorId,
          status: 401,
          timestamp: new Date().toISOString(),
        });
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    const isExpired = err?.name === 'TokenExpiredError';
    const errorId = `err_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return res.status(401).json({
      error: isExpired ? 'Session expired. Please refresh token or login again.' : 'Invalid authentication token',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      error_id: errorId,
      status: 401,
      timestamp: new Date().toISOString(),
    });
  }
}

export function requireRole(...roles: Array<'farmer' | 'officer' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

/**
 * 9. Sensitive Action Verification Middleware
 * Requires a valid, unexpired, single-use confirmation token for high-risk operations
 */
export function requireSensitiveActionVerification(actionType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers['x-sensitive-action-token'] as string) || req.body.confirmationToken;
    if (!token) {
      return res.status(403).json({
        error: 'Sensitive action verification required',
        action: actionType,
        requires_confirmation: true,
        message: 'This operation requires re-authentication or a single-use confirmation token.'
      });
    }

    const tokenEntry = memoryStore.sensitive_action_tokens.find(
      t => t.token === token && t.user_id === req.user?.id && t.action === actionType && !t.is_used
    );

    if (!tokenEntry) {
      return res.status(403).json({ error: 'Invalid or expired confirmation token for this sensitive action' });
    }

    if (new Date(tokenEntry.expires_at).getTime() < Date.now()) {
      return res.status(403).json({ error: 'Confirmation token has expired. Please request a new confirmation.' });
    }

    // Mark as consumed (strictly single-use)
    tokenEntry.is_used = true;
    next();
  };
}

export function logAuditAction(actorId: string | undefined, actorRole: string | undefined, action: string, entityType: string, entityId?: string, oldValue?: any, newValue?: any) {
  memoryStore.audit_logs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    actor_id: actorId || null,
    actor_role: actorRole || 'system',
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    old_value: oldValue || null,
    new_value: newValue || null,
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });
}

/**
 * 6. Data Access Logging (Auditing Access to Sensitive Information)
 * Compliance with DPDP Act 2023: Records when personal or banking PII is viewed
 */
export function logDataAccess(
  actorId: string | undefined,
  actorRole: string | undefined,
  resourceType: string,
  resourceId: string,
  purpose: string = 'FARMER_RECORD_VIEW',
  ipAddress: string = '127.0.0.1'
) {
  memoryStore.audit_logs.unshift({
    id: `access-log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    actor_id: actorId || null,
    actor_role: actorRole || 'anonymous',
    action: 'DATA_ACCESS_READ_PII',
    entity_type: resourceType,
    entity_id: resourceId,
    old_value: null,
    new_value: { purpose, access_type: 'PII_READ' },
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  });
}

/**
 * 9. API Key Authentication & Verification Middleware
 * Accepts X-API-Key header or X-Weighbridge-Key header, supporting active & grace-period keys
 */
export function requireApiKey(requiredRole?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawKey = (req.headers['x-api-key'] || req.headers['x-weighbridge-key']) as string;
    if (!rawKey) {
      return res.status(401).json({
        error: 'API key is required in X-API-Key or X-Weighbridge-Key header',
        code: 'API_KEY_REQUIRED',
        status: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const { isValid, role, isGracePeriod } = validateApiKey(rawKey, requiredRole);
    if (!isValid) {
      return res.status(403).json({
        error: 'Invalid, expired, or revoked API key',
        code: 'API_KEY_INVALID',
        status: 403,
        timestamp: new Date().toISOString(),
      });
    }

    if (isGracePeriod) {
      res.setHeader('X-API-Key-Warning', 'This API key is in its 24-hour grace overlap period. Please migrate to the newly rotated key.');
    }

    next();
  };
}

