import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();

// GET /api/centres
router.get('/', (req: Request, res: Response) => {
  const { state, district, crop_type } = req.query;

  let centres = memoryStore.procurement_centres.filter(c => c.is_active);

  if (state && typeof state === 'string') {
    centres = centres.filter(c => c.state.toLowerCase() === state.toLowerCase());
  }
  if (district && typeof district === 'string') {
    centres = centres.filter(c => c.district.toLowerCase() === district.toLowerCase());
  }
  if (crop_type && typeof crop_type === 'string') {
    centres = centres.filter(c => c.crops_accepted.some((crop: string) => crop.toLowerCase() === crop_type.toLowerCase()));
  }

  // Attach today's load, wait time prediction, and rating
  const enhanced = centres.map(c => {
    const today = new Date().toISOString().split('T')[0];
    const todaySlots = memoryStore.slots.filter(s => s.centre_id === c.id && s.slot_date === today);
    const bookedCount = todaySlots.reduce((sum, s) => sum + s.booked_count, 0);
    const maxCapacity = todaySlots.reduce((sum, s) => sum + s.max_capacity, 0) || c.daily_slot_capacity;
    const loadPct = maxCapacity > 0 ? Math.round((bookedCount / maxCapacity) * 100) : 60;

    let congestion: 'low' | 'medium' | 'high' | 'peak' = 'low';
    if (loadPct > 85) congestion = 'peak';
    else if (loadPct > 65) congestion = 'high';
    else if (loadPct > 40) congestion = 'medium';

    return {
      ...c,
      today_booked_slots: bookedCount,
      today_max_slots: maxCapacity,
      load_pct: loadPct,
      congestion,
      estimated_wait_minutes: congestion === 'peak' ? 65 : congestion === 'high' ? 45 : congestion === 'medium' ? 25 : 15,
      best_time_today: '12:00–14:00',
    };
  });

  return res.json(enhanced);
});

// GET /api/centres/:id
router.get('/:id', (req: Request, res: Response) => {
  const centre = memoryStore.procurement_centres.find(c => c.id === req.params.id);
  if (!centre) {
    return res.status(404).json({ error: 'Procurement centre not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySlots = memoryStore.slots.filter(s => s.centre_id === centre.id && s.slot_date === today);
  const bookedCount = todaySlots.reduce((sum, s) => sum + s.booked_count, 0);
  const maxCapacity = todaySlots.reduce((sum, s) => sum + s.max_capacity, 0) || centre.daily_slot_capacity;

  return res.json({
    ...centre,
    today_stats: {
      booked_slots: bookedCount,
      capacity: maxCapacity,
      load_pct: maxCapacity > 0 ? Math.round((bookedCount / maxCapacity) * 100) : 50,
      active_queue_count: memoryStore.queue_entries.filter(q => q.centre_id === centre.id && q.status === 'waiting').length,
    },
  });
});

// GET /api/centres/:id/stats
router.get('/:id/stats', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const centreId = req.params.id;
  const today = new Date().toISOString().split('T')[0];

  const todayBookings = memoryStore.bookings.filter(b => b.centre_id === centreId);
  const todayQueue = memoryStore.queue_entries.filter(q => q.centre_id === centreId && q.queue_date === today);
  const todayProcurements = memoryStore.procurements.filter(p => p.centre_id === centreId && p.procurement_date === today);

  const totalQuantityKg = todayProcurements.reduce((sum, p) => sum + Number(p.quantity_kg), 0);
  const totalAmountPaid = todayProcurements.reduce((sum, p) => sum + Number(p.total_amount), 0);

  return res.json({
    centreId,
    date: today,
    totalBooked: todayBookings.length,
    arrived: todayQueue.filter(q => q.status !== 'waiting').length,
    inService: todayQueue.filter(q => q.status === 'in_service').length,
    completed: todayQueue.filter(q => q.status === 'done').length,
    waiting: todayQueue.filter(q => q.status === 'waiting').length,
    totalProcuredKg: totalQuantityKg,
    totalDisbursed: totalAmountPaid,
  });
});

// POST /api/centres (Admin only)
router.post('/', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const { name, address, district, state, pincode, lat, lng, contact_phone, daily_slot_capacity, crops_accepted } = req.body;

  const newCentre = {
    id: `centre-${Date.now()}`,
    name,
    address,
    district,
    state,
    pincode,
    lat: Number(lat || 30.0),
    lng: Number(lng || 75.0),
    contact_phone,
    daily_slot_capacity: Number(daily_slot_capacity || 80),
    crops_accepted: crops_accepted || ['wheat', 'paddy'],
    is_active: true,
    operating_hours_start: '08:00',
    operating_hours_end: '17:00',
    avg_rating: 5.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryStore.procurement_centres.push(newCentre);
  logAuditAction(req.user!.id, req.user!.role, 'CENTRE_CREATED', 'procurement_centres', newCentre.id, null, newCentre);

  return res.status(201).json(newCentre);
});

// PUT /api/centres/:id
router.put('/:id', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const centre = memoryStore.procurement_centres.find(c => c.id === req.params.id);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  const oldCentre = { ...centre };
  Object.assign(centre, req.body, { updated_at: new Date().toISOString() });
  logAuditAction(req.user!.id, req.user!.role, 'CENTRE_UPDATED', 'procurement_centres', centre.id, oldCentre, centre);

  return res.json(centre);
});

// DELETE /api/centres/:id
router.delete('/:id', authMiddleware, requireRole('admin'), (req: Request, res: Response) => {
  const centre = memoryStore.procurement_centres.find(c => c.id === req.params.id);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  centre.is_active = false;
  centre.updated_at = new Date().toISOString();
  logAuditAction(req.user!.id, req.user!.role, 'CENTRE_DEACTIVATED', 'procurement_centres', centre.id);

  return res.json({ message: 'Centre deactivated successfully' });
});

export default router;
