import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'krishiseva_csrf_protection_secret_salt_2026';

/**
 * Generate a cryptographically signed CSRF token
 */
export function generateCsrfToken(): string {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const hmac = crypto.createHmac('sha256', CSRF_SECRET).update(randomBytes).digest('hex');
  return `${randomBytes}.${hmac}`;
}

/**
 * Validate that a CSRF token has not been tampered with
 */
export function verifyCsrfToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }

  const [randomBytes, signature] = token.split('.');
  if (!randomBytes || !signature) return false;

  const expectedHmac = crypto.createHmac('sha256', CSRF_SECRET).update(randomBytes).digest('hex');

  // Constant-time buffer comparison to prevent timing attacks
  try {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expectedHmac, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * CSRF Protection Middleware
 * Protects state-changing HTTP methods (POST, PUT, DELETE, PATCH)
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // CSRF defense targets ambient credential abuse (session cookies)
  const hasSessionCookie = Boolean(req.cookies && req.cookies.krishi_session);
  const authHeader = req.headers.authorization;
  const isBearerAuth = Boolean(authHeader && authHeader.startsWith('Bearer '));

  // If using programmatic Bearer tokens or API keys, browser CSRF is impossible
  if (isBearerAuth) {
    return next();
  }

  // If request has no session cookie and no CSRF cookie/header, it is an unauthenticated public mutation
  if (!hasSessionCookie && !req.cookies?.krishi_csrf && !req.headers['x-csrf-token']) {
    return next();
  }

  // Double Submit Cookie / Custom Header validation
  const clientToken = (req.headers['x-csrf-token'] as string) || req.body?._csrf;
  const cookieToken = req.cookies?.krishi_csrf;

  if (!clientToken || !verifyCsrfToken(clientToken)) {
    return res.status(403).json({
      error: 'CSRF token missing or invalid. Request rejected.',
      code: 'CSRF_TOKEN_INVALID',
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  // If cookie exists, ensure header matches cookie
  if (cookieToken && cookieToken !== clientToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch between header and cookie.',
      code: 'CSRF_TOKEN_MISMATCH',
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

/**
 * Express handler to generate and issue a CSRF token
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const token = generateCsrfToken();
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('krishi_csrf', token, {
    httpOnly: false, // Must be readable by client JS to set X-CSRF-Token header
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  return res.json({
    csrfToken: token,
    headerName: 'X-CSRF-Token',
    valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
