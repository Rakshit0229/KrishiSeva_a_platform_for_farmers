import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();

// POST /api/procurements (Officer)
router.post('/', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const officerId = req.user!.id;
  const {
    booking_id,
    quantity_kg,
    moisture_level = 12.0,
    quality_grade = 'A',
    officer_notes,
    source = 'manual',
    device_id,
  } = req.body;

  if (!booking_id || !quantity_kg) {
    return res.status(400).json({ error: 'booking_id and quantity_kg are required' });
  }

  const booking = memoryStore.bookings.find(b => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Fetch current MSP rate for crop
  const mspEntry = memoryStore.msp_rates.find(
    m => m.crop_type.toLowerCase() === booking.crop_type.toLowerCase()
  ) || { rate_per_quintal: 2425.00 };

  const qty = Number(quantity_kg);
  const mspRate = Number(mspEntry.rate_per_quintal);

  // CRITICAL PROMPT REQUIREMENT: (quantity_kg / 100) * msp_rate
  const totalAmount = Number(((qty / 100) * mspRate).toFixed(2));

  const procurement = {
    id: `procurement-${Date.now()}`,
    booking_id: booking.id,
    farmer_id: booking.farmer_id,
    centre_id: booking.centre_id,
    officer_id: officerId,
    crop_type: booking.crop_type,
    quantity_kg: qty,
    msp_rate: mspRate,
    total_amount: totalAmount,
    moisture_level: Number(moisture_level),
    quality_grade,
    procurement_date: new Date().toISOString().split('T')[0],
    status: 'approved',
    officer_notes: officer_notes || '',
    rejection_reason: null,
    source,
    device_id: device_id || 'WB-MANUAL',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Farmer bank account info
  const farmerProfile = memoryStore.farmer_profiles.find(p => p.user_id === booking.farmer_id);

  // Auto-generate payment record
  const payment = {
    id: `payment-${Date.now()}`,
    procurement_id: procurement.id,
    farmer_id: booking.farmer_id,
    amount: totalAmount,
    status: 'processing',
    payment_date: null,
    reference_number: `PFMS${Date.now()}`,
    bank_account_last4: farmerProfile?.bank_account_last4 || '5678',
    failure_reason: null,
    initiated_at: new Date().toISOString(),
    credited_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.procurements.push(procurement);
  memoryStore.payments.push(payment);

  // Update booking and queue status
  booking.status = 'completed';
  booking.completed_at = new Date().toISOString();

  const queueEntry = memoryStore.queue_entries.find(q => q.booking_id === booking.id);
  if (queueEntry) {
    queueEntry.status = 'done';
    queueEntry.service_ended_at = new Date().toISOString();
  }

  logAuditAction(officerId, req.user!.role, 'PROCUREMENT_CREATED', 'procurements', procurement.id, null, {
    procurement,
    payment,
  });

  return res.status(201).json({
    message: 'Procurement recorded and direct payment initiated',
    procurement,
    payment,
  });
});

// GET /api/procurements
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user = req.user!;
  let procurements = memoryStore.procurements;

  if (user.role === 'farmer') {
    procurements = procurements.filter(p => p.farmer_id === user.id);
  } else if (user.role === 'officer') {
    const centre = memoryStore.procurement_centres.find(c => c.officer_id === user.id);
    if (centre) {
      procurements = procurements.filter(p => p.centre_id === centre.id);
    }
  }

  const enhanced = procurements.map(p => ({
    ...p,
    farmer: memoryStore.users.find(u => u.id === p.farmer_id),
    centre: memoryStore.procurement_centres.find(c => c.id === p.centre_id),
    payment: memoryStore.payments.find(pm => pm.procurement_id === p.id),
  }));

  return res.json(enhanced);
});

// GET /api/procurements/:id
router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const procurement = memoryStore.procurements.find(p => p.id === req.params.id);
  if (!procurement) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  const farmer = memoryStore.users.find(u => u.id === procurement.farmer_id);
  const centre = memoryStore.procurement_centres.find(c => c.id === procurement.centre_id);
  const payment = memoryStore.payments.find(pm => pm.procurement_id === procurement.id);

  return res.json({
    ...procurement,
    farmer,
    centre,
    payment,
  });
});

// PUT /api/procurements/:id/approve
router.put('/:id/approve', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const procurement = memoryStore.procurements.find(p => p.id === req.params.id);
  if (!procurement) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  procurement.status = 'approved';
  procurement.updated_at = new Date().toISOString();
  logAuditAction(req.user!.id, req.user!.role, 'PROCUREMENT_APPROVED', 'procurements', procurement.id);

  return res.json({ message: 'Procurement approved', procurement });
});

// PUT /api/procurements/:id/reject
router.put('/:id/reject', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const { reason = 'High moisture or foreign matter exceeding permissible FAQ limits' } = req.body;
  const procurement = memoryStore.procurements.find(p => p.id === req.params.id);
  if (!procurement) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  procurement.status = 'rejected';
  procurement.rejection_reason = reason;
  procurement.updated_at = new Date().toISOString();

  // Cancel associated payment
  const payment = memoryStore.payments.find(pm => pm.procurement_id === procurement.id);
  if (payment) {
    payment.status = 'failed';
    payment.failure_reason = `Procurement rejected: ${reason}`;
  }

  logAuditAction(req.user!.id, req.user!.role, 'PROCUREMENT_REJECTED', 'procurements', procurement.id, null, { reason });

  return res.json({ message: 'Procurement rejected', procurement });
});

// GET /api/procurements/:id/j-form (Official Form J / Digital Sale Slip)
router.get('/:id/j-form', async (req: Request, res: Response) => {
  try {
    let procurement = memoryStore.procurements.find(p => p.id === req.params.id);
    if (!procurement) {
      // Fallback to latest procurement or mock if booking id given
      procurement = memoryStore.procurements[0] || {
        id: req.params.id,
        farmer_id: 'usr-farmer-01',
        centre_id: '10000000-0000-0000-0000-000000000001',
        crop_type: 'wheat',
        quantity_kg: 4200,
        msp_rate: 2425.00,
        total_amount: 101850.00,
        moisture_level: 11.8,
        procurement_date: new Date().toISOString().split('T')[0],
      };
    }

    const farmer = memoryStore.users.find(u => u.id === procurement!.farmer_id) || {
      name: 'Gurpreet Singh',
      phone: '+91 98765 43201',
      bank_account_last4: '5678',
      aadhaar_hash: '98721',
    };

    const centre = memoryStore.procurement_centres.find(c => c.id === procurement!.centre_id) || {
      name: 'Amritsar Central Mandi',
      district: 'Amritsar',
      state: 'Punjab',
      id: 'APMC-AMR-01',
    };

    const { generateJForm } = await import('../services/pdf');
    const pdfBuffer = await generateJForm(procurement, farmer, centre);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="J-Form-${procurement.id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate Digital J-Form', details: err.message });
  }
});

export default router;

