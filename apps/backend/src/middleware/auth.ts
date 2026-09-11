import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../db';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name: string;
  role: 'farmer' | 'officer' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'krishiseva_secure_secret_key_change_in_production';

export function signJwtToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { id: user.id, phone: user.phone, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
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
