import { Router, Request, Response } from 'express';
import { generateDomainResponse, evaluateDomainGuardrails } from '../services/aiGuardrails';
import { memoryStore } from '../db';

const router = Router();

router.post('/message', (req: Request, res: Response) => {
  const { message, language = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  const result = generateDomainResponse(message, language);

  if (!result.isAllowed) {
    memoryStore.audit_logs.unshift({
      id: 'audit-' + Date.now(),
      action: 'CHAT_OFF_TOPIC_REFUSAL',
      details: { query: message.slice(0, 120), category: result.domainCategory },
      timestamp: new Date().toISOString(),
    });
  }

  return res.json(result);
});

router.get('/topics', (_req: Request, res: Response) => {
  return res.json({
    disclaimer: 'Domain-Restricted AI Assistant: 100% Focused on Agriculture, Mandis & MSP',
    quick_categories: [
      {
        id: 'msp',
        label: '🌾 2026 MSP Rates',
        prompt: 'What are the current MSP rates for Wheat, Mustard and Paddy?',
      },
      {
        id: 'slot',
        label: '📅 Slot Booking & Pass',
        prompt: 'How do I book an APMC mandi slot and get a QR ticket?',
      },
      {
        id: 'moisture',
        label: '💧 Moisture (FAQ) Norms',
        prompt: 'What is the maximum allowed moisture for wheat and mustard at mandi?',
      },
      {
        id: 'delay',
        label: '🚨 Tractor Breakdown',
        prompt: 'My tractor broke down on the highway, how do I keep my slot token active?',
      },
      {
        id: 'dbt',
        label: '💳 72-Hour DBT Payment',
        prompt: 'How long does it take for MSP money to reach my bank account via DBT?',
      },
      {
        id: 'health',
        label: '🌱 Crop Pest Doctor',
        prompt: 'How do I identify and treat yellow rust in wheat or white rust in mustard?',
      },
    ],
  });
});

export default router;
