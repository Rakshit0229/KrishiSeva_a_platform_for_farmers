import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// In-memory log for WhatsApp messages
export const whatsappLogs: Array<{
  id: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  message: string;
  intent?: string;
  timestamp: string;
}> = [];

// POST /api/whatsapp/webhook (Twilio WhatsApp Inbound Webhook)
router.post('/webhook', (req: Request, res: Response) => {
  const { Body = '', From = '+919876543201' } = req.body;
  const cleanPhone = String(From).replace('whatsapp:', '');
  const text = Body.trim().toLowerCase();

  console.log(`[WHATSAPP INBOUND] From: ${cleanPhone} | Message: "${text}"`);

  let reply = '';
  let detectedIntent = 'UNKNOWN';

  if (/slot|book|बुक|booking|सवेरा|mandi/.test(text)) {
    detectedIntent = 'BOOK_SLOT';
    reply = `🌾 *KrishiSeva Mandi Slot Booking*\n\nNearest centre: *Amritsar Central Mandi*\nNext open slot: Tomorrow 09:00 AM - 10:00 AM\nTo confirm, reply: *CONFIRM WHEAT 500KG*\nOr book online: http://localhost:3000/farmer/book-slot`;
  } else if (/queue|token|कतार|लाइन|नंबर|wait/.test(text)) {
    detectedIntent = 'CHECK_QUEUE';
    reply = `🎫 *KrishiSeva Live Queue Update*\n\nYour Token: *#47*\nCurrently Serving: *#44*\nEstimated Wait Time: *~20 Minutes*\nCentre: Amritsar Central Mandi (Bay 1)\nTrack live on screen: http://localhost:3000/farmer/queue`;
  } else if (/pay|payment|पैसे|रुपए|paisa|bank|dbt/.test(text)) {
    detectedIntent = 'CHECK_PAYMENT';
    reply = `💰 *KrishiSeva DBT Payment Status*\n\nLatest Settlement: *₹48,500 Credited*\nCrop: Wheat (20 Quintals)\nStatus: *100% PFMS Direct Credit*\nBank A/C: ending in *5678*\nRef: *PFMS-2026-998811*`;
  } else {
    detectedIntent = 'HELP';
    reply = `🌾 *Welcome to KrishiSeva WhatsApp Assistant*\n\nReply with one of the following:\n1️⃣ *BOOK* — Book mandi arrival slot\n2️⃣ *QUEUE* — Track live gate token\n3️⃣ *PAYMENT* — Check DBT bank credit\n4️⃣ *HELP* — Mandi helpline (1800-180-1551)`;
  }

  // Record logs
  whatsappLogs.push(
    {
      id: `wa-in-${Date.now()}`,
      phone: cleanPhone,
      direction: 'inbound',
      message: Body,
      intent: detectedIntent,
      timestamp: new Date().toISOString(),
    },
    {
      id: `wa-out-${Date.now() + 1}`,
      phone: cleanPhone,
      direction: 'outbound',
      message: reply,
      intent: detectedIntent,
      timestamp: new Date().toISOString(),
    }
  );

  // Return Twilio messaging XML or JSON
  res.setHeader('Content-Type', 'text/xml');
  return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`);
});

// POST /api/whatsapp/send (Outbound notification sender)
router.post('/send', (req: Request, res: Response) => {
  const { phone, template, variables = {} } = req.body;

  let message = '';
  if (template === 'booking_confirmed') {
    message = `✅ *KrishiSeva Booking Confirmed*\nToken: #${variables.token || 47}\nDate: ${variables.date || 'Tomorrow'}\nCentre: ${variables.centre || 'Amritsar Mandi'}\nShow your QR pass at gate: http://localhost:3000/farmer/bookings`;
  } else if (template === 'token_called') {
    message = `🔔 *Urgent: Token #${variables.token || 47} Called*\nPlease proceed to Weighbridge Bay ${variables.bay || 1} at ${variables.centre || 'Amritsar Central Mandi'} immediately.`;
  } else if (template === 'payment_credited') {
    message = `🎉 *Payment Credited via DBT*\nAmount: ₹${Number(variables.amount || 48500).toLocaleString('en-IN')}\nPFMS Ref: ${variables.reference || 'PFMS-998811'}\nCredited directly to bank A/C ending in ${variables.last4 || '5678'}.`;
  } else {
    message = variables.message || 'Notification from KrishiSeva Department of Consumer Affairs';
  }

  whatsappLogs.push({
    id: `wa-out-${Date.now()}`,
    phone: phone || '+919876543201',
    direction: 'outbound',
    message,
    timestamp: new Date().toISOString(),
  });

  console.log(`[WHATSAPP NOTIFICATION SENT] To: ${phone} | Template: ${template}`);

  return res.json({
    success: true,
    message: 'WhatsApp notification dispatched successfully (Demo Mode)',
    details: { phone, template, preview: message },
  });
});

// GET /api/whatsapp/logs
router.get('/logs', (_req: Request, res: Response) => {
  return res.json(whatsappLogs.slice(0, 50));
});

export default router;
