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
import { detectSqlInjection } from './middleware/validation';
import { initDataRetentionSchedule, runDataRetentionCleanup } from './services/retention.service';
import { validateEnvironmentSecrets } from './services/secrets.service';

dotenv.config();

export const app = express();

// 2. HTTPS/TLS Enforcement: Strict-Transport-Security (HSTS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
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

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Weighbridge-Key', 'X-Sensitive-Action-Token'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Global SQL Injection Detection & Defense
app.use(detectSqlInjection);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'KrishiSeva Vercel Deployment' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/weighbridge', weighbridgeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/msp', mspRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/innovations', innovationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', featureRoutes);

// 5. Proper Error Handling Middleware (No Sensitive Information Disclosure)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Log full error details and stack trace securely on the server
  console.error(`[CRITICAL ERROR ${errorId}] URL: ${req.method} ${req.originalUrl}:`, err);

  const statusCode = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Sanitize message: never expose internal database errors, sql queries, or system paths
  let safeMessage = 'An unexpected internal error occurred. Please contact support with this Error ID.';
  if (statusCode < 500 && typeof err.message === 'string') {
    // Strip any raw paths or passwords from client message
    safeMessage = err.message.replace(/([A-Z]:\\[^\s]+|\/[^\s]+)/g, '[path]');
  }

  res.status(statusCode).json({
    error: safeMessage,
    error_id: errorId,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { debug_hint: err.message }),
  });
});

// 4. Data Retention Trigger Endpoint (Admin / Compliance)
app.post('/api/admin/retention/run', (_req, res) => {
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
