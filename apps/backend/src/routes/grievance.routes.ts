import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';
import { validateGrievanceInput, validateParamId } from '../middleware/validation';

const router = Router();

// GET /api/grievances/stats
router.get('/stats', authMiddleware, (_req: Request, res: Response) => {
  const now = Date.now();
  const all = memoryStore.grievances;

  const open = all.filter(g => g.status === 'open').length;
  const in_review = all.filter(g => g.status === 'in_review').length;
  const escalated = all.filter(g => g.status === 'escalated').length;
  const resolved = all.filter(g => g.status === 'resolved' || g.status === 'closed').length;
  const overdue = all.filter(g => g.status !== 'resolved' && g.status !== 'closed' && new Date(g.sla_deadline).getTime() < now).length;

  return res.json({ open, in_review, escalated, resolved, overdue, total: all.length });
});

// POST /api/grievances (With Server-Side Length & Category Validation)
router.post('/', authMiddleware, requireRole('farmer', 'officer', 'admin'), validateGrievanceInput, (req: Request, res: Response) => {
  const farmerId = req.user!.id;
  const { category, subject, description, booking_id, centre_id, priority = 'medium' } = req.body;

  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required' });
  }

  // 72-Hour SLA
  const slaDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const grievance = {
    id: `grievance-${Date.now()}`,
    farmer_id: farmerId,
    booking_id: booking_id || null,
    procurement_id: null,
    centre_id: centre_id || memoryStore.procurement_centres[0].id,
    category,
    subject,
    description,
    status: 'open',
    priority,
    assigned_to: '00000000-0000-0000-0000-000000000002', // assigned to officer
    sla_deadline: slaDeadline,
    resolved_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.grievances.unshift(grievance);
  logAuditAction(farmerId, req.user!.role, 'GRIEVANCE_FILED', 'grievances', grievance.id, null, grievance);

  return res.status(201).json({ message: 'Grievance submitted with 72-Hour SLA commitment', grievance });
});

// GET /api/grievances
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user = req.user!;
  const { status } = req.query;

  let grievances = memoryStore.grievances;
  if (user.role === 'farmer') {
    grievances = grievances.filter(g => g.farmer_id === user.id);
  }

  if (status && typeof status === 'string') {
    grievances = grievances.filter(g => g.status === status);
  }

  const enhanced = grievances.map(g => {
    const isOverdue = g.status !== 'resolved' && g.status !== 'closed' && new Date(g.sla_deadline).getTime() < Date.now();
    return {
      ...g,
      farmer: memoryStore.users.find(u => u.id === g.farmer_id),
      centre: memoryStore.procurement_centres.find(c => c.id === g.centre_id),
      isOverdue,
    };
  });

  return res.json(enhanced);
});

// GET /api/grievances/:id (URL Parameter Validated)
router.get('/:id', authMiddleware, validateParamId('id'), (req: Request, res: Response) => {
  const grievance = memoryStore.grievances.find(g => g.id === req.params.id);
  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }

  const updates = memoryStore.grievance_updates.filter(u => u.grievance_id === grievance.id);
  const farmer = memoryStore.users.find(u => u.id === grievance.farmer_id);
  const centre = memoryStore.procurement_centres.find(c => c.id === grievance.centre_id);

  return res.json({
    ...grievance,
    farmer,
    centre,
    updates,
  });
});

// PUT /api/grievances/:id/update (URL Parameter Validated)
router.put('/:id/update', authMiddleware, requireRole('officer', 'admin'), validateParamId('id'), (req: Request, res: Response) => {
  const grievance = memoryStore.grievances.find(g => g.id === req.params.id);
  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }

  const { message, status, priority } = req.body;

  if (message) {
    memoryStore.grievance_updates.push({
      id: `gu-${Date.now()}`,
      grievance_id: grievance.id,
      author_id: req.user!.id,
      message,
      created_at: new Date().toISOString(),
    });
  }

  if (status) {
    grievance.status = status;
    if (status === 'resolved' || status === 'closed') {
      grievance.resolved_at = new Date().toISOString();
    }
  }

  if (priority) {
    grievance.priority = priority;
  }

  grievance.updated_at = new Date().toISOString();
  logAuditAction(req.user!.id, req.user!.role, 'GRIEVANCE_UPDATED', 'grievances', grievance.id, null, { status, priority, message });

  return res.json({ message: 'Grievance updated successfully', grievance });
});

// PUT /api/grievances/:id/escalate
router.put('/:id/escalate', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const grievance = memoryStore.grievances.find(g => g.id === req.params.id);
  if (!grievance) {
    return res.status(404).json({ error: 'Grievance not found' });
  }

  grievance.status = 'escalated';
  grievance.priority = 'high';
  grievance.updated_at = new Date().toISOString();

  memoryStore.grievance_updates.push({
    id: `gu-${Date.now()}`,
    grievance_id: grievance.id,
    author_id: req.user!.id,
    message: 'Auto-escalated to DoCA Central Grievance Cell due to SLA approaching or complex dispute.',
    created_at: new Date().toISOString(),
  });

  logAuditAction(req.user!.id, req.user!.role, 'GRIEVANCE_ESCALATED', 'grievances', grievance.id);

  return res.json({ message: 'Grievance escalated to DoCA admin', grievance });
});

export default router;
