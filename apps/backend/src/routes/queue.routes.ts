import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';
import { publishQueueEvent } from '../services/redis';
import { registerSSEClient } from '../services/sse';

const router = Router();

// GET /api/queue/:centreId?date=YYYY-MM-DD
router.get('/:centreId', (req: Request, res: Response) => {
  const { centreId } = req.params;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const entries = memoryStore.queue_entries.filter(
    q => q.centre_id === centreId && q.queue_date === date
  );

  const enhanced = entries.map(q => {
    const booking = memoryStore.bookings.find(b => b.id === q.booking_id);
    const farmer = booking ? memoryStore.users.find(u => u.id === booking.farmer_id) : null;
    return {
      ...q,
      booking,
      farmer,
    };
  }).sort((a, b) => a.token_number - b.token_number);

  return res.json(enhanced);
});

// GET /api/queue/position/:bookingId
router.get('/position/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const booking = memoryStore.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const queueEntry = memoryStore.queue_entries.find(q => q.booking_id === bookingId);
  if (!queueEntry) {
    return res.status(404).json({ error: 'Queue entry not found' });
  }

  const centreEntries = memoryStore.queue_entries.filter(
    q => q.centre_id === queueEntry.centre_id && q.queue_date === queueEntry.queue_date
  );

  const waitingOrCalled = centreEntries.filter(
    q => (q.status === 'waiting' || q.status === 'called') && q.token_number < queueEntry.token_number
  );

  const currentlyServing = centreEntries.find(q => q.status === 'in_service');

  const aheadCount = waitingOrCalled.length;
  const estimatedWaitMinutes = Math.max(5, aheadCount * 12);

  return res.json({
    tokenNumber: queueEntry.token_number,
    position: aheadCount + 1,
    aheadCount,
    estimatedWaitMinutes,
    currentlyServing: currentlyServing ? currentlyServing.token_number : 44,
    status: queueEntry.status,
    centreId: queueEntry.centre_id,
  });
});

// PUT /api/queue/:entryId/call
router.put('/:entryId/call', authMiddleware, requireRole('officer', 'admin'), async (req: Request, res: Response) => {
  const entry = memoryStore.queue_entries.find(q => q.id === req.params.entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Queue entry not found' });
  }

  const oldEntry = { ...entry };
  entry.status = 'called';
  entry.called_at = new Date().toISOString();
  entry.updated_at = new Date().toISOString();

  const booking = memoryStore.bookings.find(b => b.id === entry.booking_id);
  const farmer = booking ? memoryStore.users.find(u => u.id === booking.farmer_id) : null;

  console.log(`[MOCK SMS] To ${farmer?.phone}: Token #${entry.token_number} called at gate/weighbridge! Please proceed.`);

  publishQueueEvent(entry.centre_id, {
    type: 'token_called',
    tokenNumber: entry.token_number,
    centreId: entry.centre_id,
    farmerName: farmer?.name || 'Farmer',
    cropType: booking?.crop_type || 'Crop',
    expectedKg: booking?.expected_quantity_kg || 0,
  });

  logAuditAction(req.user!.id, req.user!.role, 'QUEUE_TOKEN_CALLED', 'queue_entries', entry.id, oldEntry, entry);

  return res.json({ message: `Token #${entry.token_number} called`, entry });
});

// PUT /api/queue/:entryId/serve
router.put('/:entryId/serve', authMiddleware, requireRole('officer', 'admin'), async (req: Request, res: Response) => {
  const entry = memoryStore.queue_entries.find(q => q.id === req.params.entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Queue entry not found' });
  }

  // Set any currently serving in this centre to done/waiting
  memoryStore.queue_entries
    .filter(q => q.centre_id === entry.centre_id && q.status === 'in_service' && q.id !== entry.id)
    .forEach(q => {
      q.status = 'done';
      q.service_ended_at = new Date().toISOString();
    });

  entry.status = 'in_service';
  entry.service_started_at = new Date().toISOString();
  entry.updated_at = new Date().toISOString();

  const booking = memoryStore.bookings.find(b => b.id === entry.booking_id);
  if (booking) {
    booking.status = 'in_service';
  }

  const farmer = booking ? memoryStore.users.find(u => u.id === booking.farmer_id) : null;

  publishQueueEvent(entry.centre_id, {
    type: 'token_serving',
    tokenNumber: entry.token_number,
    centreId: entry.centre_id,
    farmerName: farmer?.name || 'Farmer',
    cropType: booking?.crop_type || 'Crop',
    expectedKg: booking?.expected_quantity_kg || 0,
  });

  logAuditAction(req.user!.id, req.user!.role, 'QUEUE_TOKEN_SERVING', 'queue_entries', entry.id);

  return res.json({ message: `Token #${entry.token_number} is now in service`, entry });
});

// PUT /api/queue/:entryId/done
router.put('/:entryId/done', authMiddleware, requireRole('officer', 'admin'), async (req: Request, res: Response) => {
  const entry = memoryStore.queue_entries.find(q => q.id === req.params.entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Queue entry not found' });
  }

  entry.status = 'done';
  entry.service_ended_at = new Date().toISOString();
  entry.updated_at = new Date().toISOString();

  const booking = memoryStore.bookings.find(b => b.id === entry.booking_id);
  if (booking) {
    booking.status = 'completed';
    booking.completed_at = new Date().toISOString();
  }

  publishQueueEvent(entry.centre_id, {
    type: 'token_completed',
    tokenNumber: entry.token_number,
    centreId: entry.centre_id,
  });

  logAuditAction(req.user!.id, req.user!.role, 'QUEUE_TOKEN_DONE', 'queue_entries', entry.id);

  return res.json({ message: `Token #${entry.token_number} marked as completed`, entry });
});

// PUT /api/queue/:entryId/skip
router.put('/:entryId/skip', authMiddleware, requireRole('officer', 'admin'), async (req: Request, res: Response) => {
  const entry = memoryStore.queue_entries.find(q => q.id === req.params.entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Queue entry not found' });
  }

  entry.status = 'skipped';
  entry.updated_at = new Date().toISOString();

  const booking = memoryStore.bookings.find(b => b.id === entry.booking_id);
  if (booking) {
    booking.status = 'no_show';
  }

  publishQueueEvent(entry.centre_id, {
    type: 'token_skipped',
    tokenNumber: entry.token_number,
    centreId: entry.centre_id,
  });

  logAuditAction(req.user!.id, req.user!.role, 'QUEUE_TOKEN_SKIPPED', 'queue_entries', entry.id);

  return res.json({ message: `Token #${entry.token_number} skipped`, entry });
});

// GET /api/queue/stream/:centreId (SSE Stream)
router.get('/stream/:centreId', (req: Request, res: Response) => {
  const { centreId } = req.params;
  const clientId = `sse-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const today = new Date().toISOString().split('T')[0];

  const currentEntries = memoryStore.queue_entries.filter(
    q => q.centre_id === centreId && q.queue_date === today
  );

  const currentlyServing = currentEntries.find(q => q.status === 'in_service');
  const waitingTokens = currentEntries
    .filter(q => q.status === 'waiting' || q.status === 'called')
    .map(q => q.token_number);

  const snapshot = {
    centreId,
    currentlyServing: currentlyServing ? currentlyServing.token_number : 44,
    waitingTokens,
    totalWaiting: waitingTokens.length,
    completedToday: currentEntries.filter(q => q.status === 'done').length,
    timestamp: new Date().toISOString(),
  };

  registerSSEClient(clientId, centreId, res, snapshot);
});

export default router;
