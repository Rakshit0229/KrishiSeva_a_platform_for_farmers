import app, { initializeBackend } from '../apps/backend/src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initializeBackend();
  return (app as any)(req, res);
}
