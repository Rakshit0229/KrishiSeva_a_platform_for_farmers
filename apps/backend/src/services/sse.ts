import { Response } from 'express';
import { subscribeQueueChannel } from './redis';

interface SSEClient {
  id: string;
  res: Response;
  centreId: string;
}

const sseClients = new Map<string, SSEClient>();

export function registerSSEClient(clientId: string, centreId: string, res: Response, initialSnapshot: any) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  // Flush initial snapshot
  res.write(`data: ${JSON.stringify({ type: 'snapshot', data: initialSnapshot })}\n\n`);

  const client: SSEClient = { id: clientId, res, centreId };
  sseClients.set(clientId, client);

  // Subscribe to Redis / PubSub channel for this centre
  const unsubscribe = subscribeQueueChannel(centreId, (eventData) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  });

  // Heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeatInterval);
    unsubscribe();
    sseClients.delete(clientId);
  });
}

export function broadcastToCentre(centreId: string, event: { type: string; data: any }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients.values()) {
    if (client.centreId === centreId) {
      try {
        client.res.write(payload);
      } catch (err) {
        // connection broken
      }
    }
  }
}
