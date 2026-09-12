import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../db';
import { generateSecureToken } from '../services/security.service';

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

/**
 * 2. Secure Session Management & Session Fixation Protection
 * Issues fresh cryptographic sessionId per login and stores in active_sessions
 */
export function createSession(user: { id: string; phone: string; name: string; role: 'farmer' | 'officer' | 'admin' }, ip: string = '127.0.0.1', userAgent: string = 'browser'): { token: string; sessionId: string } {
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

  const token = jwt.sign(
    { id: user.id, phone: user.phone, name: user.name, role: user.role, sessionId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, sessionId };
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
    return res.status(401).json({ error: 'Authentication token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    // Check server-side session revocation (Secure Logout check)
    if (decoded.sessionId) {
      const activeSession = memoryStore.active_sessions.find(s => s.id === decoded.sessionId);
      if (activeSession && activeSession.is_revoked) {
        return res.status(401).json({ error: 'Session has been revoked/logged out. Please login again.' });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token' });
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
