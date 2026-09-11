import { Router, Request, Response } from 'express';
import { memoryStore } from '../db';

const router = Router();

// Helper to wrap TwiML XML
function twimlResponse(xmlContent: string, res: Response) {
  res.setHeader('Content-Type', 'text/xml');
  return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${xmlContent}</Response>`);
}

// POST /api/voice/incoming (Twilio Webhook for incoming voice call)
router.post('/incoming', (req: Request, res: Response) => {
  const caller = req.body.From || req.query.From || 'Unknown';
  console.log(`[IVR CALL INCOMING] From: ${caller}`);

  const xml = `
    <Say language="hi-IN" voice="Polly.Aditi">
      नमस्ते! कृषिसेवा में आपका स्वागत है। 
      मंडी स्लॉट बुक करने के लिए 1 दबाएं। 
      अपनी कतार या टोकन स्थिति जानने के लिए 2 दबाएं। 
      फसल भुगतान की जानकारी के लिए 3 दबाएं। 
      सहायता अधिकारी से बात करने के लिए 0 दबाएं।
    </Say>
    <Gather numDigits="1" action="/api/voice/menu" method="POST" timeout="10" />
    <Say language="hi-IN" voice="Polly.Aditi">हमें कोई इनपुट नहीं मिला। कृपया पुनः प्रयास करें। धन्यवाद।</Say>
  `;
  return twimlResponse(xml, res);
});

// POST /api/voice/menu (Process DTMF menu selection)
router.post('/menu', (req: Request, res: Response) => {
  const digits = req.body.Digits || req.body.digits || req.query.Digits;
  const caller = req.body.From || '+919876543201';

  console.log(`[IVR MENU SELECTION] Caller: ${caller} selected: ${digits}`);

  if (digits === '1') {
    // Booking Flow
    const xml = `
      <Say language="hi-IN" voice="Polly.Aditi">
        स्लॉट बुकिंग सेवा: गेहूं के लिए 1 दबाएं। धान के लिए 2 दबाएं। सरसों के लिए 3 दबाएं। मक्का के लिए 4 दबाएं।
      </Say>
      <Gather numDigits="1" action="/api/voice/booking-flow" method="POST" timeout="8" />
    `;
    return twimlResponse(xml, res);
  }

  if (digits === '2') {
    // Queue Status
    const booking = memoryStore.bookings.find(b => b.status === 'confirmed' || b.status === 'arrived');
    const token = booking?.token_number || 47;
    const xml = `
      <Say language="hi-IN" voice="Polly.Aditi">
        आपकी वर्तमान बुकिंग अमृतसर सेंट्रल मंडी के लिए है। आपका टोकन नंबर ${token} है। 
        वर्तमान में टोकन नंबर 44 सेवा में है। आपका अनुमानित प्रतीक्षा समय लगभग 20 मिनट है।
      </Say>
      <Say language="hi-IN" voice="Polly.Aditi">कृषिसेवा का उपयोग करने के लिए धन्यवाद।</Say>
    `;
    return twimlResponse(xml, res);
  }

  if (digits === '3') {
    // Payment Status
    const payment = memoryStore.payments[0] || { amount: 48500, status: 'credited', reference_number: 'PFMS998811' };
    const xml = `
      <Say language="hi-IN" voice="Polly.Aditi">
        आपका नवीनतम भुगतान रुपये ${payment.amount} का है। 
        यह भुगतान पी.एफ.एम.एस. द्वारा आपके बैंक खाते में सफलतापूर्वक जमा कर दिया गया है। 
        संदर्भ संख्या ${payment.reference_number || 'PFMS123456'} है।
      </Say>
    `;
    return twimlResponse(xml, res);
  }

  if (digits === '0') {
    // Officer Helpline
    const xml = `
      <Say language="hi-IN" voice="Polly.Aditi">
        आपकी कॉल कृषिसेवा किसान सहायता केंद्र से जोड़ी जा रही है। कृपया प्रतीक्षा करें।
      </Say>
      <Dial>1800-180-1551</Dial>
    `;
    return twimlResponse(xml, res);
  }

  // Fallback
  const fallbackXml = `
    <Say language="hi-IN" voice="Polly.Aditi">अमान्य विकल्प। मुख्य मेनू पर वापस जा रहे हैं।</Say>
    <Redirect>/api/voice/incoming</Redirect>
  `;
  return twimlResponse(fallbackXml, res);
});

// POST /api/voice/booking-flow (Crop selection and booking completion)
router.post('/booking-flow', (req: Request, res: Response) => {
  const digits = req.body.Digits || '1';
  const cropMap: Record<string, string> = {
    '1': 'गेहूं (Wheat)',
    '2': 'धान (Paddy)',
    '3': 'सरसों (Mustard)',
    '4': 'मक्का (Maize)',
  };
  const selectedCrop = cropMap[digits] || 'गेहूं (Wheat)';

  const xml = `
    <Say language="hi-IN" voice="Polly.Aditi">
      आपने ${selectedCrop} चुना है। कल सुबह 10 बजे के लिए आपका टोकन नंबर 52 आरक्षित कर दिया गया है। 
      कन्फर्मेशन एस.एम.एस. और डिजिटल पास आपके मोबाइल नंबर पर भेज दिया गया है। कृषिसेवा में आपका स्वागत है।
    </Say>
  `;
  return twimlResponse(xml, res);
});

// POST /api/voice/status (Twilio Call Status Callback)
router.post('/status', (req: Request, res: Response) => {
  const { CallSid, CallDuration, CallStatus, From } = req.body;
  console.log(`[IVR SESSION COMPLETE] SID: ${CallSid}, Duration: ${CallDuration}s, Status: ${CallStatus}, From: ${From}`);
  return res.json({ recorded: true });
});

// POST /api/voice/fallback (Error Handler)
router.post('/fallback', (_req: Request, res: Response) => {
  const xml = `
    <Say language="hi-IN" voice="Polly.Aditi">
      खेद है, कुछ तकनीकी समस्या आई है। कृपया टोल-फ्री नंबर 1800-180-1551 पर कॉल करें।
    </Say>
  `;
  return twimlResponse(xml, res);
});

export default router;
