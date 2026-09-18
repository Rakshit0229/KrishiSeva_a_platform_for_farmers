/**
 * KrishiSeva Production Client Error Logger & Telemetry
 * Captures uncaught exceptions, unhandled rejections, and form submission errors.
 */

export interface ClientErrorPayload {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  type: 'UNCAUGHT_EXCEPTION' | 'UNHANDLED_REJECTION' | 'FORM_ERROR' | 'NETWORK_ERROR';
  metadata?: Record<string, any>;
}

const ERROR_BUFFER: ClientErrorPayload[] = [];
const MAX_BUFFER = 25;
let isFlushing = false;

export function captureClientError(error: Partial<ClientErrorPayload>) {
  const payload: ClientErrorPayload = {
    message: error.message || 'Unknown runtime error',
    source: error.source || window.location.pathname,
    lineno: error.lineno,
    colno: error.colno,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    type: error.type || 'UNCAUGHT_EXCEPTION',
    metadata: error.metadata || {},
  };

  ERROR_BUFFER.push(payload);
  if (ERROR_BUFFER.length > MAX_BUFFER) {
    ERROR_BUFFER.shift();
  }

  scheduleFlush();
}

let flushTimeout: any = null;
function scheduleFlush() {
  if (flushTimeout) return;
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushErrors();
  }, 2000);
}

async function flushErrors() {
  if (isFlushing || ERROR_BUFFER.length === 0) return;
  isFlushing = true;

  const toSend = [...ERROR_BUFFER];
  try {
    const res = await fetch('/api/v1/telemetry/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: toSend }),
    });

    if (res.ok) {
      ERROR_BUFFER.splice(0, toSend.length);
    }
  } catch {
    // If backend is unreachable, retain buffer silently without throwing
  } finally {
    isFlushing = false;
  }
}

/**
 * Initialize global error listeners
 */
export function initClientErrorTracking() {
  if (typeof window === 'undefined') return;

  // Window uncaught exceptions
  window.addEventListener('error', (event) => {
    captureClientError({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      type: 'UNCAUGHT_EXCEPTION',
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureClientError({
      message: typeof event.reason === 'object' ? event.reason?.message : String(event.reason),
      stack: event.reason?.stack,
      type: 'UNHANDLED_REJECTION',
    });
  });

  // Broken link tracking (capture 404 image or script assets)
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const assetUrl = (target as any).src || (target as any).href;
        captureClientError({
          message: `Asset failed to load: <${target.tagName.toLowerCase()}> ${assetUrl}`,
          source: assetUrl,
          type: 'NETWORK_ERROR',
        });
      }
    },
    true
  );
}
