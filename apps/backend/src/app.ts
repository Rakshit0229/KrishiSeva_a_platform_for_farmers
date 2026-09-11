import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

dotenv.config();

export const app = express();

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Weighbridge-Key'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api', featureRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

let isInitialized = false;
export async function initializeBackend() {
  if (!isInitialized) {
    await checkDbConnection();
    await seedDatabase();
    isInitialized = true;
  }
}

// Auto-initialize on import
initializeBackend().catch(err => console.warn('Backend auto-initialization warning:', err.message));

export default app;
