import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  getApiSecurityMetrics,
  getSecurityAlerts,
  resolveSecurityAlert
} from '../services/monitoring.service';

const router = Router();

// GET /api/v1/admin/security/metrics (System API Health & Threat Status)
router.get('/metrics', authMiddleware, requireRole('admin'), (_req: Request, res: Response) => {
  const metrics = getApiSecurityMetrics();
  return res.json(metrics);
});

// GET /api/v1/admin/security/alerts (Anomaly & Intrusion Alerts)
router.get('/alerts', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const alerts = getSecurityAlerts(limit);
  return res.json({ alerts, count: alerts.length });
});

// POST /api/v1/admin/security/alerts/:id/resolve
router.post('/alerts/:id/resolve', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const { id } = req.params;
  const success = resolveSecurityAlert(id);
  if (!success) {
    return res.status(404).json({ error: 'Alert not found', code: 'ALERT_NOT_FOUND' });
  }
  return res.json({ message: 'Security alert marked as resolved', alert_id: id });
});

import { rotateEmergencySecrets } from '../services/secrets.service';

// POST /api/v1/admin/security/rotate-secrets (Emergency Secret Rotation)
router.post('/rotate-secrets', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ error: 'Reason is required for emergency secret rotation', code: 'REASON_REQUIRED' });
  }

  const result = rotateEmergencySecrets(reason, req.user?.id);
  return res.json(result);
});

export default router;
