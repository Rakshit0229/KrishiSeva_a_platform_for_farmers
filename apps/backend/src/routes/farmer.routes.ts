import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();

// GET /api/farmers/profile
router.get('/profile', authMiddleware, requireRole('farmer', 'officer', 'admin'), (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = memoryStore.users.find(u => u.id === userId);
  const profile = memoryStore.farmer_profiles.find(p => p.user_id === userId);

  return res.json({
    user,
    profile: profile || {
      user_id: userId,
      crop_types: [],
      land_area_acres: 0,
      village: '',
      district: '',
      state: '',
      pincode: '',
      bank_name: '',
      bank_account_last4: '',
      ifsc_code: '',
      profile_complete: false,
    },
  });
});

// PUT /api/farmers/profile
router.put('/profile', authMiddleware, requireRole('farmer', 'officer', 'admin'), (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    name,
    aadhaar_last4,
    crop_types,
    land_area_acres,
    village,
    district,
    state,
    pincode,
    bank_name,
    bank_account_last4,
    ifsc_code,
  } = req.body;

  // Update user name if provided
  if (name) {
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) {
      user.name = name;
      user.updated_at = new Date().toISOString();
    }
  }

  let profile = memoryStore.farmer_profiles.find(p => p.user_id === userId);
  const oldProfile = profile ? { ...profile } : null;

  const isComplete = Boolean(
    village && district && state && bank_name && bank_account_last4 && ifsc_code
  );

  if (profile) {
    Object.assign(profile, {
      aadhaar_last4: aadhaar_last4 || profile.aadhaar_last4,
      crop_types: crop_types || profile.crop_types,
      land_area_acres: land_area_acres !== undefined ? Number(land_area_acres) : profile.land_area_acres,
      village: village || profile.village,
      district: district || profile.district,
      state: state || profile.state,
      pincode: pincode || profile.pincode,
      bank_name: bank_name || profile.bank_name,
      bank_account_last4: bank_account_last4 || profile.bank_account_last4,
      ifsc_code: ifsc_code || profile.ifsc_code,
      profile_complete: isComplete,
      updated_at: new Date().toISOString(),
    });
  } else {
    profile = {
      id: `profile-${Date.now()}`,
      user_id: userId,
      aadhaar_last4,
      crop_types: crop_types || [],
      land_area_acres: Number(land_area_acres || 0),
      village,
      district,
      state,
      pincode,
      bank_name,
      bank_account_last4,
      ifsc_code,
      profile_complete: isComplete,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.farmer_profiles.push(profile);
  }

  logAuditAction(userId, req.user!.role, 'FARMER_PROFILE_UPDATED', 'farmer_profiles', profile.id, oldProfile, profile);

  return res.json({ message: 'Profile updated successfully', profile });
});

// GET /api/farmers/dashboard
router.get('/dashboard', authMiddleware, requireRole('farmer', 'officer', 'admin'), (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = memoryStore.users.find(u => u.id === userId);
  const profile = memoryStore.farmer_profiles.find(p => p.user_id === userId);

  // Find user's bookings
  const userBookings = memoryStore.bookings.filter(b => b.farmer_id === userId);
  const upcomingBookings = userBookings
    .filter(b => b.status === 'confirmed' || b.status === 'arrived' || b.status === 'in_service')
    .sort((a, b) => new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime());

  const nextBooking = upcomingBookings[0] || null;
  let nextBookingCentre = null;
  let nextBookingSlot = null;

  if (nextBooking) {
    nextBookingCentre = memoryStore.procurement_centres.find(c => c.id === nextBooking.centre_id);
    nextBookingSlot = memoryStore.slots.find(s => s.id === nextBooking.slot_id);
  }

  // Queue position for active booking
  let queuePosition = null;
  if (nextBooking) {
    const queueEntry = memoryStore.queue_entries.find(q => q.booking_id === nextBooking.id);
    if (queueEntry) {
      const allWaiting = memoryStore.queue_entries.filter(
        q => q.centre_id === nextBooking.centre_id && (q.status === 'waiting' || q.status === 'called')
      );
      const aheadCount = allWaiting.filter(q => q.token_number < queueEntry.token_number).length;
      const currentlyServing = memoryStore.queue_entries.find(
        q => q.centre_id === nextBooking.centre_id && q.status === 'in_service'
      );

      queuePosition = {
        tokenNumber: queueEntry.token_number,
        position: aheadCount + 1,
        aheadCount,
        currentlyServing: currentlyServing ? currentlyServing.token_number : 44,
        estimatedWaitMinutes: Math.max(10, aheadCount * 12),
        status: queueEntry.status,
      };
    }
  }

  // Payments summary
  const userPayments = memoryStore.payments.filter(p => p.farmer_id === userId);
  const totalEarned = userPayments
    .filter(p => p.status === 'credited')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingPayments = userPayments
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return res.json({
    user,
    profile,
    nextBooking: nextBooking ? {
      ...nextBooking,
      centre: nextBookingCentre,
      slot: nextBookingSlot,
    } : null,
    queuePosition,
    totalEarned,
    pendingPayments,
    recentBookings: userBookings.slice(0, 3).map(b => ({
      ...b,
      centre: memoryStore.procurement_centres.find(c => c.id === b.centre_id),
      slot: memoryStore.slots.find(s => s.id === b.slot_id),
    })),
    recentPayments: userPayments.slice(0, 3).map(p => ({
      ...p,
      procurement: memoryStore.procurements.find(pr => pr.id === p.procurement_id),
    })),
  });
});

// In-memory farmer flags store
export const farmerFlags: Array<{
  id: string;
  farmer_id: string;
  flagged_by: string;
  reason: 'no_show' | 'duplicate_booking' | 'crop_manipulation' | 'weight_discrepancy';
  details: string;
  severity: 'warning' | 'suspended' | 'blacklisted';
  is_active: boolean;
  created_at: string;
}> = [
  {
    id: 'flag-01',
    farmer_id: '20000000-0000-0000-0000-000000000003',
    flagged_by: '00000000-0000-0000-0000-000000000002',
    reason: 'no_show',
    details: 'Unannounced missed slot on 2026-08-15 without prior cancellation.',
    severity: 'warning',
    is_active: true,
    created_at: '2026-08-16T10:00:00Z',
  },
];

// POST /api/farmers/:id/flag (Officer/Admin issues warning or flag)
router.post('/:id/flag', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const { reason, details, severity = 'warning' } = req.body;
  const farmerId = req.params.id;

  const flag = {
    id: `flag-${Date.now()}`,
    farmer_id: farmerId,
    flagged_by: req.user!.id,
    reason: reason || 'no_show',
    details: details || 'Compliance flag issued by mandi gate officer.',
    severity: severity as 'warning' | 'suspended' | 'blacklisted',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  farmerFlags.unshift(flag);
  logAuditAction(req.user!.id, req.user!.role, 'FARMER_FLAGGED', 'users', farmerId, null, flag);

  return res.status(201).json({ message: 'Compliance flag issued successfully', flag });
});

// GET /api/farmers/:id/flags (Fetch flags for a farmer)
router.get('/:id/flags', authMiddleware, (req: Request, res: Response) => {
  const flags = farmerFlags.filter(f => f.farmer_id === req.params.id && f.is_active);
  return res.json(flags);
});

// GET /api/farmers/flags/all (Admin/Officer list all active flags)
router.get('/flags/all', authMiddleware, requireRole('officer', 'admin'), (_req: Request, res: Response) => {
  return res.json(farmerFlags);
});

export default router;
