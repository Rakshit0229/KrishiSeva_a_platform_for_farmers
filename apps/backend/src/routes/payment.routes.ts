import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();

// GET /api/payments
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user = req.user!;
  let payments = memoryStore.payments;

  if (user.role === 'farmer') {
    payments = payments.filter(p => p.farmer_id === user.id);
  }

  const enhanced = payments.map(p => {
    const procurement = memoryStore.procurements.find(pr => pr.id === p.procurement_id);
    const farmer = memoryStore.users.find(u => u.id === p.farmer_id);
    const centre = procurement ? memoryStore.procurement_centres.find(c => c.id === procurement.centre_id) : null;
    
    // Check if delayed > 72h
    const initiatedTime = new Date(p.initiated_at || p.created_at).getTime();
    const hoursElapsed = (Date.now() - initiatedTime) / (1000 * 60 * 60);
    const isDelayedOver72h = (p.status === 'pending' || p.status === 'processing') && hoursElapsed > 72;

    return {
      ...p,
      procurement,
      farmer,
      centre,
      isDelayedOver72h,
      hoursElapsed: Math.round(hoursElapsed),
    };
  });

  return res.json(enhanced);
});

// GET /api/payments/summary
router.get('/summary', authMiddleware, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  let payments = memoryStore.payments;
  if (userRole === 'farmer') {
    payments = payments.filter(p => p.farmer_id === userId);
  }

  const credited = payments.filter(p => p.status === 'credited');
  const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing');

  const totalEarned = credited.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0);

  return res.json({
    totalEarned,
    pendingAmount,
    creditedCount: credited.length,
    pendingCount: pending.length,
  });
});

// GET /api/payments/pending (Admin Red Flag)
router.get('/pending', authMiddleware, requireRole('admin'), (_req: Request, res: Response) => {
  const now = Date.now();
  const delayed = memoryStore.payments.filter(p => {
    if (p.status !== 'pending' && p.status !== 'processing') return false;
    const initiated = new Date(p.initiated_at || p.created_at).getTime();
    return (now - initiated) > (72 * 60 * 60 * 1000);
  }).map(p => ({
    ...p,
    farmer: memoryStore.users.find(u => u.id === p.farmer_id),
    procurement: memoryStore.procurements.find(pr => pr.id === p.procurement_id),
  }));

  return res.json(delayed);
});

// GET /api/payments/:id
router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const payment = memoryStore.payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  const procurement = memoryStore.procurements.find(pr => pr.id === payment.procurement_id);
  const farmer = memoryStore.users.find(u => u.id === payment.farmer_id);
  const centre = procurement ? memoryStore.procurement_centres.find(c => c.id === procurement.centre_id) : null;

  return res.json({
    ...payment,
    procurement,
    farmer,
    centre,
  });
});

// PUT /api/payments/:id/process (Admin)
router.put('/:id/process', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const payment = memoryStore.payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  payment.status = 'processing';
  payment.updated_at = new Date().toISOString();
  logAuditAction(req.user!.id, req.user!.role, 'PAYMENT_PROCESSING', 'payments', payment.id);

  return res.json({ message: 'Payment marked as processing in PFMS gateway', payment });
});

// PUT /api/payments/:id/credit (Admin)
router.put('/:id/credit', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const { reference_number } = req.body;
  const payment = memoryStore.payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  payment.status = 'credited';
  payment.payment_date = new Date().toISOString().split('T')[0];
  payment.credited_at = new Date().toISOString();
  payment.reference_number = reference_number || `PFMS${Date.now()}`;
  payment.updated_at = new Date().toISOString();

  const farmer = memoryStore.users.find(u => u.id === payment.farmer_id);
  console.log(`[MOCK SMS] To ${farmer?.phone}: ₹${payment.amount} credited via DBT directly to A/C ending in ${payment.bank_account_last4}. Ref: ${payment.reference_number}. Jai Kisan!`);

  logAuditAction(req.user!.id, req.user!.role, 'PAYMENT_CREDITED', 'payments', payment.id, null, payment);

  return res.json({ message: 'Payment marked as credited successfully', payment });
});

export default router;
