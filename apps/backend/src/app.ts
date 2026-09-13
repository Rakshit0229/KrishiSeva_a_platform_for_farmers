import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { checkDbConnection } from './db';
import { seedDatabase } from './db/seed';

import authRoutes from './routes/auth.routes';
import farmerRoutes from './routes/farmer.routes';
import centreRoutes from './routes/centre.routes';
import slotRoutes from './routes/slot.routes';
import bookingRoutes from './routes/booking.routes';
import queueRoutes from './routes/queue.routes';
import procurementRoutes from './routes/procurement.routes';
import weighbridgeRoutes from './routes/weighbridge.routes';
import paymentRoutes from './routes/payment.routes';
import grievanceRoutes from './routes/grievance.routes';
import mspRoutes from './routes/msp.routes';
import featureRoutes from './routes/features.routes';
import voiceRoutes from './routes/voice.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import chatRoutes from './routes/chat.routes';
import innovationsRoutes from './routes/innovations.routes';
import uploadRoutes from './routes/upload.routes';
import monitoringRoutes from './routes/monitoring.routes';
import infraRoutes from './routes/infra.routes';
import { ipFirewall } from './middleware/firewall';
import { detectSqlInjection } from './middleware/validation';
import { authRateLimiter, standardApiLimiter, intensiveApiLimiter } from './middleware/rateLimiter';
import { csrfProtection, getCsrfTokenHandler } from './middleware/csrf';
import { apiMonitoringMiddleware } from './services/monitoring.service';
import { initDataRetentionSchedule, runDataRetentionCleanup } from './services/retention.service';
import { validateEnvironmentSecrets } from './services/secrets.service';

dotenv.config();

export const app = express();

// 1. Content Security Policy (CSP) & Transport Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://images.unsplash.com"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https:", "wss:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// 2. Enforce HTTPS in production via reverse proxy headers
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// 4. CORS Whitelist Policy: Restrict origins that can access API resources
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Server-to-server or curl requests
  
  // In development, permit localhost and loopback origins
  if (process.env.NODE_ENV !== 'production') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return true;
    }
  }

  const normalized = origin.toLowerCase();
  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  // Trusted Indian government portal domains
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'krishiseva.gov.in' ||
      host.endsWith('.krishiseva.gov.in') ||
      host.endsWith('.gov.in') ||
      host.endsWith('.nic.in')
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized to access this resource`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Weighbridge-Key', 'X-Sensitive-Action-Token', 'X-CSRF-Token', 'X-API-Key'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Network Security Controls & IP Firewall
app.use(ipFirewall);

// 8. API Monitoring & Intrusion Telemetry
app.use(apiMonitoringMiddleware);

// 5. API Versioning Headers & Content Protection
app.use((_req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 3. Global SQL Injection Detection & Defense
app.use(detectSqlInjection);

// CSRF Token Generation endpoint (Public & Safe)
app.get(['/api/csrf-token', '/api/v1/csrf-token'], getCsrfTokenHandler);

// 7. CSRF Protection for state-changing operations
app.use(csrfProtection);

// ==========================================
// 5. API VERSIONING HIERARCHY (/api/v1)
// ==========================================
const v1Router = express.Router();

// Health Check
v1Router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    time: new Date().toISOString(),
    platform: 'KrishiSeva National Procurement Engine'
  });
});

// 2. API Rate Limiting: Tiered Protection
v1Router.use('/auth', authRateLimiter, authRoutes);
v1Router.use('/upload', intensiveApiLimiter, uploadRoutes);
v1Router.use('/farmers', farmerRoutes);
v1Router.use('/centres', centreRoutes);
v1Router.use('/slots', slotRoutes);
v1Router.use('/bookings', bookingRoutes);
v1Router.use('/queue', queueRoutes);
v1Router.use('/procurements', procurementRoutes);
v1Router.use('/weighbridge', weighbridgeRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/grievances', grievanceRoutes);
v1Router.use('/msp', mspRoutes);
v1Router.use('/voice', voiceRoutes);
v1Router.use('/whatsapp', whatsappRoutes);
v1Router.use('/chat', chatRoutes);
v1Router.use('/innovations', innovationsRoutes);
v1Router.use('/admin/security', monitoringRoutes);
v1Router.use('/admin/infra', infraRoutes);
v1Router.use('/', featureRoutes);

// Mount /api/v1 as primary versioned API
app.use('/api/v1', standardApiLimiter, v1Router);

// Maintain 100% backward compatibility: alias /api to v1Router
app.use('/api', standardApiLimiter, v1Router);

// 4. Proper API Error Handling Middleware (No Sensitive Information Disclosure)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Log full error details and stack trace securely on the server
  console.error(`[CRITICAL ERROR ${errorId}] URL: ${req.method} ${req.originalUrl}:`, err);

  const statusCode = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Determine error code
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  if (statusCode === 400) errorCode = err.code || 'BAD_REQUEST';
  if (statusCode === 401) errorCode = err.code || 'UNAUTHORIZED';
  if (statusCode === 403) errorCode = err.code || 'FORBIDDEN';
  if (statusCode === 404) errorCode = err.code || 'NOT_FOUND';
  if (statusCode === 422) errorCode = err.code || 'VALIDATION_FAILED';
  if (statusCode === 429) errorCode = err.code || 'RATE_LIMIT_EXCEEDED';

  // Sanitize message: never expose internal database errors, sql queries, or system paths
  let safeMessage = 'An unexpected internal error occurred. Please contact support with this Error ID.';
  if (statusCode < 500 && typeof err.message === 'string') {
    // Strip any raw paths or passwords from client message
    safeMessage = err.message.replace(/([A-Z]:\\[^\s]+|\/[^\s]+)/g, '[path]');
  }

  res.status(statusCode).json({
    error: safeMessage,
    code: errorCode,
    error_id: errorId,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { debug_hint: err.message }),
  });
});

// 4. Data Retention Trigger Endpoint (Admin / Compliance)
app.post(['/api/admin/retention/run', '/api/v1/admin/retention/run'], (_req, res) => {
  const report = runDataRetentionCleanup();
  res.json({ message: 'Data retention cleanup executed successfully', report });
});

let isInitialized = false;
export async function initializeBackend() {
  if (!isInitialized) {
    validateEnvironmentSecrets();
    await checkDbConnection();
    await seedDatabase();
    initDataRetentionSchedule();
    isInitialized = true;
  }
}

// Auto-initialize on import
initializeBackend().catch(err => console.warn('Backend auto-initialization warning:', err.message));

export default app;
