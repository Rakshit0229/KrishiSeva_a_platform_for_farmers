import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { memoryStore } from '../db';
import { authMiddleware, signJwtToken, logAuditAction } from '../middleware/auth';

const router = Router();

// Demo OTP code accepted for all test numbers
const DEMO_OTP = '123456';

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  const { phone, role = 'farmer' } = req.body;

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Valid phone number is required' });
  }

  const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(DEMO_OTP, salt);

  // Store/overwrite OTP session
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Auto-register user if not present
  let user = memoryStore.users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      name: role === 'officer' ? 'Mandi Officer' : role === 'admin' ? 'DoCA Administrator' : 'Kisan Farmer',
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);

    if (role === 'farmer') {
      memoryStore.farmer_profiles.push({
        id: `profile-${Date.now()}`,
        user_id: user.id,
        crop_types: ['wheat', 'paddy'],
        land_area_acres: 5.0,
        village: 'Kisan Nagar',
        district: 'Amritsar',
        state: 'Punjab',
        pincode: '143001',
        bank_name: 'State Bank of India',
        bank_account_last4: '1234',
        ifsc_code: 'SBIN0001234',
        profile_complete: true,
      });
    }
  }

  console.log(`[MOCK SMS] OTP for ${cleanPhone}: ${DEMO_OTP} (Expires: ${expiresAt.toISOString()})`);
  logAuditAction(user.id, user.role, 'AUTH_OTP_SENT', 'users', user.id);

  return res.json({
    message: 'OTP sent successfully to mobile number',
    phone: cleanPhone,
    demo_hint: 'Use OTP 123456 for instant demo login',
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, selectedRole } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

  // Check demo OTP
  if (otp !== DEMO_OTP) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please try 123456.' });
  }

  let user = memoryStore.users.find(u => u.phone === cleanPhone);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone: cleanPhone,
      name: selectedRole === 'officer' ? 'Mandi Officer' : selectedRole === 'admin' ? 'DoCA Administrator' : 'Kisan Farmer',
      role: selectedRole || 'farmer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.users.push(user);
  }

  // Update role if selected in login flow and user is not admin
  if (selectedRole && user.role !== 'admin') {
    user.role = selectedRole;
  }

  const token = signJwtToken({
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
  });

  logAuditAction(user.id, user.role, 'AUTH_LOGIN_SUCCESS', 'users', user.id);

  return res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = memoryStore.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = memoryStore.farmer_profiles.find(p => p.user_id === user.id);

  return res.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      profile: profile || null,
    },
  });
});

export default router;
