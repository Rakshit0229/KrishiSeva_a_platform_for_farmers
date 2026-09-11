import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';
import { authMiddleware, requireRole, logAuditAction } from '../middleware/auth';

const router = Router();
const WEIGHBRIDGE_API_KEY = process.env.WEIGHBRIDGE_API_KEY || 'krishiseva_iot_key_2026';

// Middleware for IoT weighbridge key
function requireWeighbridgeKey(req: Request, res: Response, next: any) {
  const key = req.headers['x-weighbridge-key'];
  if (!key || key !== WEIGHBRIDGE_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing X-Weighbridge-Key header' });
  }
  next();
}

// POST /api/weighbridge/reading (Hardware Endpoint)
router.post('/reading', requireWeighbridgeKey, (req: Request, res: Response) => {
  const { centre_id, booking_id, gross_weight_kg, tare_weight_kg, net_weight_kg, device_id } = req.body;

  const reading = {
    id: `wb-reading-${Date.now()}`,
    centre_id,
    booking_id,
    gross_weight_kg: Number(gross_weight_kg),
    tare_weight_kg: Number(tare_weight_kg),
    net_weight_kg: Number(net_weight_kg || gross_weight_kg - tare_weight_kg),
    device_id: device_id || 'WB-IOT-01',
    timestamp: new Date().toISOString(),
  };

  memoryStore.weighbridge_readings.unshift(reading);
  console.log(`[IoT WEIGHBRIDGE] New reading: ${reading.net_weight_kg} kg from device ${reading.device_id}`);

  return res.status(201).json({ message: 'IoT weighbridge reading recorded', reading });
});

// POST /api/weighbridge/simulate (Demo Mode)
router.post('/simulate', authMiddleware, requireRole('officer', 'admin'), (req: Request, res: Response) => {
  const { booking_id, net_weight_kg = 498.5 } = req.body;

  const booking = memoryStore.bookings.find(b => b.id === booking_id);
  const centreId = booking ? booking.centre_id : memoryStore.procurement_centres[0].id;

  const reading = {
    id: `wb-sim-${Date.now()}`,
    centre_id: centreId,
    booking_id: booking_id || null,
    gross_weight_kg: Number(net_weight_kg) + 1200, // truck weight
    tare_weight_kg: 1200,
    net_weight_kg: Number(net_weight_kg),
    device_id: 'WB-SIM-TESTBAY-01',
    timestamp: new Date().toISOString(),
  };

  memoryStore.weighbridge_readings.unshift(reading);
  logAuditAction(req.user!.id, req.user!.role, 'WEIGHBRIDGE_SIMULATED', 'weighbridge', reading.id, null, reading);

  return res.json({
    message: 'Weighbridge reading simulated successfully',
    reading,
  });
});

// GET /api/weighbridge/readings/:centreId
router.get('/readings/:centreId', authMiddleware, (req: Request, res: Response) => {
  const readings = memoryStore.weighbridge_readings
    .filter(r => r.centre_id === req.params.centreId)
    .slice(0, 50);

  return res.json(readings);
});

// GET /api/weighbridge/devices
router.get('/devices', authMiddleware, requireRole('officer', 'admin'), (_req: Request, res: Response) => {
  return res.json([
    { id: 'WB-AMR-01', name: 'Amritsar Platform Scale Bay 1', status: 'online', calibrated_at: '2026-09-01' },
    { id: 'WB-AMR-02', name: 'Amritsar Heavy Scale Bay 2', status: 'online', calibrated_at: '2026-09-01' },
    { id: 'WB-LDH-01', name: 'Ludhiana Digital Weighbridge 1', status: 'online', calibrated_at: '2026-08-28' },
    { id: 'WB-HSR-01', name: 'Hisar Electronic Scale Bay 1', status: 'online', calibrated_at: '2026-08-25' },
  ]);
});

export default router;
