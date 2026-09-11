import { useState, useEffect, useRef } from 'react';

export interface SSEQueueSnapshot {
  centreId: string;
  currentlyServing: number;
  waitingTokens: number[];
  totalWaiting: number;
  completedToday: number;
  timestamp: string;
}

export function useSSEQueue(centreId: string | undefined) {
  const [snapshot, setSnapshot] = useState<SSEQueueSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastCalledEvent, setLastCalledEvent] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const backoffRef = useRef(1000); // starts at 1s

  useEffect(() => {
    if (!centreId) return;

    let isMounted = true;

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const streamUrl = `/api/queue/stream/${centreId}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isMounted) return;
        setIsConnected(true);
        backoffRef.current = 1000; // reset backoff
      };

      es.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'snapshot') {
            setSnapshot(parsed.data);
          } else if (parsed.type === 'token_called') {
            setLastCalledEvent(parsed);
            setSnapshot((prev) => prev ? {
              ...prev,
              currentlyServing: parsed.tokenNumber,
            } : null);
          } else if (parsed.type === 'token_serving') {
            setSnapshot((prev) => prev ? {
              ...prev,
              currentlyServing: parsed.tokenNumber,
            } : null);
          } else if (parsed.type === 'token_completed') {
            setSnapshot((prev) => prev ? {
              ...prev,
              completedToday: prev.completedToday + 1,
              waitingTokens: prev.waitingTokens.filter(t => t !== parsed.tokenNumber),
            } : null);
          }
        } catch (e) {
          // heartbeat or unparseable
        }
      };

      es.onerror = () => {
        if (!isMounted) return;
        setIsConnected(false);
        es.close();

        // Exponential backoff: 1s -> 2s -> 4s -> 8s -> 30s
        const nextBackoff = Math.min(30000, backoffRef.current * 2);
        backoffRef.current = nextBackoff;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) connect();
        }, backoffRef.current);
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [centreId]);

  return { snapshot, isConnected, lastCalledEvent };
}
