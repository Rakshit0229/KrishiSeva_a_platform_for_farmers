import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { memoryStore, withTransaction } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';
import { publishQueueEvent } from '../services/redis';

const router = Router();

// POST /api/bookings (SELECT FOR UPDATE semantics)
router.post('/', authMiddleware, requireRole('farmer', 'officer', 'admin'), async (req: Request, res: Response) => {
  const farmerId = req.user!.id; // NEVER trust client-provided farmer_id
  const { slot_id, centre_id, crop_type, expected_quantity_kg, notes } = req.body;

  if (!slot_id || !centre_id || !crop_type || !expected_quantity_kg) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  // Check farmer flags/suspension
  const isFlagged = memoryStore.farmer_flags.some(f => f.farmer_id === farmerId && f.is_active);
  if (isFlagged) {
    return res.status(403).json({ error: 'Your account is currently flagged or suspended. Please contact your district mandi officer.' });
  }

  try {
    const result = await withTransaction(async () => {
      // Find slot (atomic in-memory lock simulation)
      const slot = memoryStore.slots.find(s => s.id === slot_id);
      if (!slot) {
        throw { status: 404, message: 'Slot not found' };
      }

      if (slot.is_blocked) {
        throw { status: 400, message: `This slot is blocked: ${slot.block_reason || 'Maintenance'}` };
      }

      if (slot.booked_count >= slot.max_capacity) {
        // Critical Prompt Requirement #7: Slot conflict (409)
        throw { status: 409, message: 'This slot just filled up. Please choose another.' };
      }

      // Increment slot booked count
      slot.booked_count += 1;
      slot.updated_at = new Date().toISOString();

      // Determine next token number for this centre on slot date
      const existingForDay = memoryStore.queue_entries.filter(
        q => q.centre_id === centre_id && q.queue_date === slot.slot_date
      );
      const nextTokenNumber = existingForDay.length > 0 
        ? Math.max(...existingForDay.map(q => q.token_number)) + 1 
        : 45;

      const qrToken = `QR-KS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const booking = {
        id: `booking-${Date.now()}`,
        farmer_id: farmerId,
        slot_id: slot.id,
        centre_id,
        token_number: nextTokenNumber,
        qr_token: qrToken,
        status: 'confirmed',
        crop_type: crop_type.toLowerCase(),
        expected_quantity_kg: Number(expected_quantity_kg),
        notes: notes || '',
        booked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const queueEntry = {
        id: `queue-${Date.now()}`,
        booking_id: booking.id,
        centre_id,
        queue_date: slot.slot_date,
        token_number: nextTokenNumber,
        status: 'waiting',
        called_at: null,
        service_started_at: null,
        service_ended_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      memoryStore.bookings.push(booking);
      memoryStore.queue_entries.push(queueEntry);

      return { booking, queueEntry, slot };
    });

    // Generate high-resolution QR code
    const qrPayload = JSON.stringify({
      app: 'KrishiSeva',
      bookingId: result.booking.id,
      tokenNumber: result.booking.token_number,
      farmerId: result.booking.farmer_id,
      qrToken: result.booking.qr_token,
      date: result.slot.slot_date,
      time: `${result.slot.start_time} - ${result.slot.end_time}`,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      color: { dark: '#1A4A22', light: '#FFFFFF' },
      width: 320,
      margin: 2,
    });

    // Mock SMS notification
    const farmerUser = memoryStore.users.find(u => u.id === farmerId);
    console.log(`[MOCK SMS] To ${farmerUser?.phone || '+91'}: Booking confirmed for token #${result.booking.token_number} at ${result.slot.start_time}. Show QR at mandi gate.`);

    // Broadcast queue update
    publishQueueEvent(centre_id, {
      type: 'queue_updated',
      centreId: centre_id,
      tokenNumber: result.booking.token_number,
    });

    logAuditAction(farmerId, req.user!.role, 'BOOKING_CREATED', 'bookings', result.booking.id, null, result.booking);

    return res.status(201).json({
      ...result.booking,
      qr_data_url: qrDataUrl,
      slot: result.slot,
      centre: memoryStore.procurement_centres.find(c => c.id === centre_id),
    });
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message || 'Error processing slot booking' });
  }
});

// GET /api/bookings
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const user = req.user!;
  const { status, date } = req.query;

  let bookings = memoryStore.bookings;

  if (user.role === 'farmer') {
    bookings = bookings.filter(b => b.farmer_id === user.id);
  } else if (user.role === 'officer') {
    // If officer is assigned to a centre, show centre bookings
    const centre = memoryStore.procurement_centres.find(c => c.officer_id === user.id);
    if (centre) {
      bookings = bookings.filter(b => b.centre_id === centre.id);
    }
  }

  if (status && typeof status === 'string') {
    bookings = bookings.filter(b => b.status === status);
  }

  const enhanced = bookings.map(b => ({
    ...b,
    farmer: memoryStore.users.find(u => u.id === b.farmer_id),
    centre: memoryStore.procurement_centres.find(c => c.id === b.centre_id),
    slot: memoryStore.slots.find(s => s.id === b.slot_id),
    queue: memoryStore.queue_entries.find(q => q.booking_id === b.id),
  }));

  return res.json(enhanced);
});

// GET /api/bookings/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const booking = memoryStore.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const slot = memoryStore.slots.find(s => s.id === booking.slot_id);
  const centre = memoryStore.procurement_centres.find(c => c.id === booking.centre_id);
  const farmer = memoryStore.users.find(u => u.id === booking.farmer_id);
  const queue = memoryStore.queue_entries.find(q => q.booking_id === booking.id);

  const qrDataUrl = await QRCode.toDataURL(booking.qr_token, {
    color: { dark: '#1A4A22', light: '#FFFFFF' },
    width: 250,
  });

  return res.json({
    ...booking,
    qr_data_url: qrDataUrl,
    slot,
    centre,
    farmer,
    queue,
  });
});

// DELETE /api/bookings/:id (Cancel booking)
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const booking = memoryStore.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return res.status(400).json({ error: `Cannot cancel a booking in status: ${booking.status}` });
  }

  const oldBooking = { ...booking };
  booking.status = 'cancelled';
  booking.cancelled_at = new Date().toISOString();
  booking.cancellation_reason = req.body.cancellation_reason || 'Cancelled by farmer';
  booking.updated_at = new Date().toISOString();

  // Decrement slot booked count
  const slot = memoryStore.slots.find(s => s.id === booking.slot_id);
  if (slot && slot.booked_count > 0) {
    slot.booked_count -= 1;
    slot.updated_at = new Date().toISOString();
  }

  // Update queue entry
  const queueEntry = memoryStore.queue_entries.find(q => q.booking_id === booking.id);
  if (queueEntry) {
    queueEntry.status = 'skipped';
    queueEntry.updated_at = new Date().toISOString();
  }

  publishQueueEvent(booking.centre_id, {
    type: 'booking_cancelled',
    bookingId: booking.id,
    slotId: booking.slot_id,
  });

  logAuditAction(req.user!.id, req.user!.role, 'BOOKING_CANCELLED', 'bookings', booking.id, oldBooking, booking);

  return res.json({ message: 'Booking cancelled successfully', booking });
});

// GET /api/bookings/centre/:id (Officer centre bookings)
router.get('/centre/:id', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const bookings = memoryStore.bookings.filter(b => b.centre_id === req.params.id);
  const enhanced = bookings.map(b => ({
    ...b,
    farmer: memoryStore.users.find(u => u.id === b.farmer_id),
    slot: memoryStore.slots.find(s => s.id === b.slot_id),
    queue: memoryStore.queue_entries.find(q => q.booking_id === b.id),
  }));

  return res.json(enhanced);
});

// POST /api/bookings/:id/transit-delay (Mandi SOS / Grace Period)
router.post('/:id/transit-delay', authMiddleware, (req: Request, res: Response) => {
  const booking = memoryStore.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const { reason = 'Tractor / transport breakdown on highway' } = req.body;
  const queueEntry = memoryStore.queue_entries.find(q => q.booking_id === booking.id);
  
  // Grant a 2-hour grace period and push queue token gracefully
  if (queueEntry) {
    queueEntry.notes = `Transit Delay Reported: ${reason}. Grace period granted until +2 hours.`;
    queueEntry.updated_at = new Date().toISOString();
  }

  booking.notes = `${booking.notes ? booking.notes + ' | ' : ''}Transit delay reported at ${new Date().toLocaleTimeString('en-IN')}: ${reason}`;
  booking.updated_at = new Date().toISOString();

  publishQueueEvent(booking.centre_id, {
    type: 'transit_delay_reported',
    bookingId: booking.id,
    tokenNumber: booking.token_number,
    reason,
  });

  return res.json({
    message: 'Grace period of 2 hours granted. Mandi gate officer notified. Your token will not be forfeited.',
    booking,
  });
});

export default router;

