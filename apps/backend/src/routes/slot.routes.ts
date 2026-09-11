import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();

// GET /api/slots?centre_id=&date=
router.get('/', (req: Request, res: Response) => {
  const { centre_id, date } = req.query;

  let slots = memoryStore.slots;

  if (centre_id && typeof centre_id === 'string') {
    slots = slots.filter(s => s.centre_id === centre_id);
  }

  if (date && typeof date === 'string') {
    slots = slots.filter(s => s.slot_date === date);
  }

  // Decorate slots with congestion level & availability
  const enhanced = slots.map(s => {
    const remaining = Math.max(0, s.max_capacity - s.booked_count);
    let congestion: 'low' | 'medium' | 'high' | 'peak' = 'low';
    const ratio = s.booked_count / s.max_capacity;

    if (ratio >= 0.9) congestion = 'peak';
    else if (ratio >= 0.7) congestion = 'high';
    else if (ratio >= 0.4) congestion = 'medium';

    return {
      ...s,
      remaining_capacity: remaining,
      is_full: remaining === 0,
      congestion,
    };
  });

  return res.json(enhanced);
});

// POST /api/slots/generate (Officer/Admin)
router.post('/generate', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const { centre_id, start_date, end_date, max_capacity = 10 } = req.body;

  if (!centre_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'centre_id, start_date, and end_date are required' });
  }

  const timeSlots = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];

  const start = new Date(start_date);
  const end = new Date(end_date);
  const created: any[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    for (const ts of timeSlots) {
      const existing = memoryStore.slots.find(
        s => s.centre_id === centre_id && s.slot_date === dateStr && s.start_time === ts.start
      );
      if (!existing) {
        const newSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          centre_id,
          slot_date: dateStr,
          start_time: ts.start,
          end_time: ts.end,
          max_capacity: Number(max_capacity),
          booked_count: 0,
          is_blocked: false,
          block_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memoryStore.slots.push(newSlot);
        created.push(newSlot);
      }
    }
  }

  logAuditAction(req.user!.id, req.user!.role, 'SLOTS_BATCH_GENERATED', 'slots', centre_id, null, { count: created.length });

  return res.status(201).json({ message: `Successfully generated ${created.length} slots`, slots: created });
});

// PUT /api/slots/:id/block (Officer)
router.put('/:id/block', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const { reason = 'Emergency maintenance / adverse weather' } = req.body;
  const slot = memoryStore.slots.find(s => s.id === req.params.id);

  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }

  slot.is_blocked = !slot.is_blocked;
  slot.block_reason = slot.is_blocked ? reason : null;
  slot.updated_at = new Date().toISOString();

  logAuditAction(req.user!.id, req.user!.role, 'SLOT_BLOCK_TOGGLED', 'slots', slot.id, null, { is_blocked: slot.is_blocked, reason });

  return res.json({ message: `Slot ${slot.is_blocked ? 'blocked' : 'unblocked'} successfully`, slot });
});

// POST /api/slots/:id/waitlist (Farmer joins waitlist when slot is full)
router.post('/:id/waitlist', authMiddleware, requireRole('farmer'), (req: Request, res: Response) => {
  const slot = memoryStore.slots.find(s => s.id === req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  const { crop_type = 'wheat', expected_quantity_kg = 500 } = req.body;
  const farmerId = req.user!.id;

  const existing = memoryStore.slot_waitlist.find(w => w.farmer_id === farmerId && w.slot_id === slot.id);
  if (existing) {
    return res.status(400).json({ error: 'You are already on the waitlist for this slot' });
  }

  const waitlistEntry = {
    id: `waitlist-${Date.now()}`,
    farmer_id: farmerId,
    slot_id: slot.id,
    centre_id: slot.centre_id,
    crop_type,
    expected_quantity_kg: Number(expected_quantity_kg),
    notified: false,
    created_at: new Date().toISOString(),
  };

  memoryStore.slot_waitlist.push(waitlistEntry);
  const queuePos = memoryStore.slot_waitlist.filter(w => w.slot_id === slot.id).length;

  return res.status(201).json({
    message: `Added to slot waitlist. Position #${queuePos}. You will receive SMS if a slot opens up.`,
    waitlist: waitlistEntry,
    position: queuePos,
  });
});

// GET /api/slots/waitlist/my (Farmer views their active waitlist items)
router.get('/waitlist/my', authMiddleware, (req: Request, res: Response) => {
  const myWaitlists = memoryStore.slot_waitlist
    .filter(w => w.farmer_id === req.user!.id)
    .map(w => {
      const slot = memoryStore.slots.find(s => s.id === w.slot_id);
      const centre = slot ? memoryStore.procurement_centres.find(c => c.id === slot.centre_id) : null;
      return {
        ...w,
        slot,
        centre,
      };
    });

  return res.json(myWaitlists);
});

// DELETE /api/slots/waitlist/:id (Farmer leaves waitlist)
router.delete('/waitlist/:id', authMiddleware, (req: Request, res: Response) => {
  const idx = memoryStore.slot_waitlist.findIndex(w => w.id === req.params.id && w.farmer_id === req.user!.id);
  if (idx === -1) return res.status(404).json({ error: 'Waitlist entry not found' });

  memoryStore.slot_waitlist.splice(idx, 1);
  return res.json({ message: 'Removed from slot waitlist successfully' });
});

export default router;
