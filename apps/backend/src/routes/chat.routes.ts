import { Router, Request, Response } from 'express';
import { generateDomainResponse } from '../services/aiGuardrails';
import { memoryStore } from '../db';
import {
  enforceAiAccessControl,
  validateAiGeneratedQuery,
  executeAiWithFallback,
  getAiSecurityResearchStatus
} from '../services/aiSecurity.service';

const router = Router();

// 1. AI Service Access Control applied to chat queries
router.post('/message', enforceAiAccessControl, async (req: Request, res: Response) => {
  const { message, language = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  // 3. AI Component Fallback Circuit Breaker
  const { result, isFallback } = await executeAiWithFallback(
    async () => {
      return generateDomainResponse(message, language);
    },
    message.toLowerCase().includes('msp') ? 'msp' :
    message.toLowerCase().includes('moisture') ? 'moisture' :
    message.toLowerCase().includes('breakdown') ? 'delay' : 'default',
    2500
  );

  if (isFallback) {
    return res.json({
      answer: (result as any).advice,
      isAllowed: true,
      domainCategory: (result as any).topic,
      is_fallback: true,
      fallback_source: (result as any).source,
    });
  }

  const chatResponse = result as any;
  if (!chatResponse.isAllowed) {
    memoryStore.audit_logs.unshift({
      id: 'audit-' + Date.now(),
      action: 'CHAT_OFF_TOPIC_REFUSAL',
      details: { query: message.slice(0, 120), category: chatResponse.domainCategory },
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({ ...chatResponse, is_fallback: false });
});

// 2. Validate AI-Generated Queries (Anti-SQLi & Table Whitelisting)
router.post('/validate-query', (req: Request, res: Response) => {
  const { query, params = [] } = req.body;
  const validation = validateAiGeneratedQuery(query, params);
  return res.json(validation);
});

// 4. Monitor AI Security Research Endpoint
router.get('/security-research', (_req: Request, res: Response) => {
  return res.json(getAiSecurityResearchStatus());
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
