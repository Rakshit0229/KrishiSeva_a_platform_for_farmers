import Redis from 'ioredis';
import { EventEmitter } from 'events';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class MemoryPubSub extends EventEmitter {
  private cache = new Map<string, string>();

  async publish(channel: string, message: string): Promise<number> {
    this.emit(channel, message);
    return 1;
  }

  async subscribe(channel: string, listener: (msg: string) => void) {
    this.on(channel, listener);
  }

  async unsubscribe(channel: string, listener: (msg: string) => void) {
    this.off(channel, listener);
  }

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.cache.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => this.cache.delete(key), duration * 1000);
    }
    return 'OK';
  }
}

export const memoryPubSub = new MemoryPubSub();

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't retry endlessly if not installed
    connectTimeout: 2000,
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    console.log('✅ Redis connected successfully at:', redisUrl);
  }).catch(() => {
    isRedisAvailable = false;
    console.log('ℹ️ Redis unavailable. Using resilient high-speed in-memory Pub/Sub.');
  });
} catch {
  isRedisAvailable = false;
}

export async function publishQueueEvent(centreId: string, eventData: any) {
  const channel = `queue:${centreId}`;
  const payload = JSON.stringify(eventData);

  // Always emit to local subscribers
  memoryPubSub.publish(channel, payload);

  if (isRedisAvailable && redisClient) {
    try {
      await redisClient.publish(channel, payload);
    } catch (e) {
      // ignore
    }
  }
}

export function subscribeQueueChannel(centreId: string, callback: (data: any) => void) {
  const channel = `queue:${centreId}`;
  const listener = (raw: string) => {
    try {
      callback(JSON.parse(raw));
    } catch {
      callback(raw);
    }
  };

  memoryPubSub.subscribe(channel, listener);
  return () => {
    memoryPubSub.unsubscribe(channel, listener);
  };
}
