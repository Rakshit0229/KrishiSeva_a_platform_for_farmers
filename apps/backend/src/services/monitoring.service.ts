import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../db';
import { logAuditAction } from '../middleware/auth';

export interface SecurityAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  ip: string;
  path: string;
  method: string;
  timestamp: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

// In-memory telemetry storage
interface TelemetryStats {
  totalRequests: number;
  totalDurationMs: number;
  statusCodes: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  endpoints: Map<string, number>;
  ipWindow: Map<string, { count: number; failedAuth: number; windowStart: number }>;
}

const stats: TelemetryStats = {
  totalRequests: 0,
  totalDurationMs: 0,
  statusCodes: {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  },
  endpoints: new Map(),
  ipWindow: new Map(),
};

/**
 * Record a security alert in memoryStore
 */
export function recordSecurityAlert(
  severity: SecurityAlert['severity'],
  type: string,
  message: string,
  req: Request,
  metadata?: Record<string, any>
): SecurityAlert {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip) || req.socket.remoteAddress || '127.0.0.1';

  const alert: SecurityAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    severity,
    type,
    message,
    ip: ip.trim(),
    path: req.originalUrl || req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    resolved: false,
    metadata,
  };

  memoryStore.security_alerts.unshift(alert);

  // Keep alert list capped at 200
  if (memoryStore.security_alerts.length > 200) {
    memoryStore.security_alerts.pop();
  }

  logAuditAction(req.user?.id, req.user?.role || 'system', `SECURITY_ALERT_${severity}`, 'security_alerts', alert.id, null, alert);
  console.warn(`🚨 [SECURITY MONITOR ${severity}] ${type}: ${message} (IP: ${ip}, Path: ${req.method} ${req.originalUrl})`);

  return alert;
}

/**
 * API Monitoring Middleware
 * Instruments all requests with latency, status tracking, and anomaly triggers
 */
export function apiMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const forwarded = req.headers['x-forwarded-for'];
  const ip = ((typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip) || req.socket.remoteAddress || '127.0.0.1').trim();

  // Sliding window per IP (60-second window)
  const now = Date.now();
  let ipTrack = stats.ipWindow.get(ip);
  if (!ipTrack || now - ipTrack.windowStart > 60 * 1000) {
    ipTrack = { count: 1, failedAuth: 0, windowStart: now };
    stats.ipWindow.set(ip, ipTrack);
  } else {
    ipTrack.count += 1;
  }

  // Anomaly: Rapid burst detection (> 80 requests/min from single IP)
  if (ipTrack.count === 81) {
    recordSecurityAlert(
      'HIGH',
      'RATE_ANOMALY_BURST',
      `Abnormal traffic spike detected from IP ${ip} (> 80 req/min)`,
      req,
      { requestCount: ipTrack.count }
    );
  }

  // Monitor completion
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;

    stats.totalRequests += 1;
    stats.totalDurationMs += durationMs;

    // Status code bucket
    if (statusCode >= 200 && statusCode < 300) stats.statusCodes['2xx'] += 1;
    else if (statusCode >= 300 && statusCode < 400) stats.statusCodes['3xx'] += 1;
    else if (statusCode >= 400 && statusCode < 500) {
      stats.statusCodes['4xx'] += 1;

      // Track failed authentication (401 / 403)
      if (statusCode === 401 || statusCode === 403) {
        if (ipTrack) {
          ipTrack.failedAuth += 1;
          if (ipTrack.failedAuth === 6) {
            recordSecurityAlert(
              'HIGH',
              'BRUTE_FORCE_ANOMALY',
              `Repeated authentication/authorization failures detected for IP ${ip}`,
              req,
              { failedAttempts: ipTrack.failedAuth }
            );
          }
        }
      }
    } else if (statusCode >= 500) {
      stats.statusCodes['5xx'] += 1;
      recordSecurityAlert(
        'MEDIUM',
        'SERVER_ERROR_ANOMALY',
        `Internal server error (${statusCode}) encountered during request`,
        req,
        { statusCode, durationMs }
      );
    }

    // Path frequency
    const cleanPath = (req.baseUrl || '') + (req.path || '');
    stats.endpoints.set(cleanPath, (stats.endpoints.get(cleanPath) || 0) + 1);
  });

  next();
}

/**
 * Retrieve comprehensive API security & health metrics
 */
export function getApiSecurityMetrics() {
  const avgLatency = stats.totalRequests > 0
    ? Math.round(stats.totalDurationMs / stats.totalRequests)
    : 0;

  // Convert top endpoints to sorted array
  const topEndpoints = Array.from(stats.endpoints.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([path, hits]) => ({ path, hits }));

  const activeAlerts = memoryStore.security_alerts.filter(a => !a.resolved);
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return {
    total_requests: stats.totalRequests,
    average_latency_ms: avgLatency,
    status_codes: stats.statusCodes,
    top_endpoints: topEndpoints,
    active_alerts_count: activeAlerts.length,
    critical_alerts_count: criticalCount,
    health_status: criticalCount > 0 ? 'DEGRADED_ATTACK_DETECTED' : 'HEALTHY_NORMAL',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Retrieve security alerts
 */
export function getSecurityAlerts(limit: number = 50): SecurityAlert[] {
  return memoryStore.security_alerts.slice(0, limit);
}

/**
 * Resolve security alert
 */
export function resolveSecurityAlert(alertId: string): boolean {
  const alert = memoryStore.security_alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    return true;
  }
  return false;
}
