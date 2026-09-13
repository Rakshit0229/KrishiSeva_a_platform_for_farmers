import { Request, Response, NextFunction } from 'express';
import { memoryStore } from '../db';
import { logAuditAction } from './auth';

// Blacklisted IPs identified in incident logs
const IP_BLACKLIST = new Set<string>();

// Private & loopback CIDR patterns
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^::1$/,                          // IPv6 Loopback
  /^::ffff:127\./,                  // IPv4-mapped IPv6 loopback
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,                    // 192.168.0.0/16
];

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return (req.ip || req.socket.remoteAddress || '127.0.0.1').trim();
}

/**
 * Check if an IP address belongs to a private / internal subnet
 */
export function isInternalNetworkIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

/**
 * 1. Network Security Controls & IP Firewall
 * Blocks blacklisted malicious IPs from accessing any API endpoint
 */
export function ipFirewall(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);

  if (IP_BLACKLIST.has(clientIp)) {
    return res.status(403).json({
      error: 'Access denied by network security firewall.',
      code: 'FIREWALL_IP_BLOCKED',
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

/**
 * Admin Network ACL
 * Restricts sensitive infrastructure endpoints to trusted internal networks or authenticated admins
 */
export function adminNetworkAcl(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req);
  const isInternal = isInternalNetworkIp(clientIp);
  const isProduction = process.env.NODE_ENV === 'production';

  // In production with strict internal network policy, block non-internal administrative requests
  if (isProduction && process.env.ENFORCE_INTERNAL_ADMIN === 'true' && !isInternal) {
    logAuditAction(req.user?.id, 'system', 'ADMIN_ACCESS_BLOCKED_NETWORK_ACL', 'network', clientIp);
    return res.status(403).json({
      error: 'Administrative endpoints can only be accessed from authorized internal subnets.',
      code: 'NETWORK_ACL_FORBIDDEN',
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

/**
 * Add an IP to the runtime firewall blacklist
 */
export function blacklistIp(ip: string, reason: string = 'Automated intrusion detection'): void {
  IP_BLACKLIST.add(ip.trim());
  console.warn(`🛑 [FIREWALL] Added ${ip} to network blacklist. Reason: ${reason}`);
}

/**
 * Remove an IP from the runtime firewall blacklist
 */
export function unblacklistIp(ip: string): boolean {
  return IP_BLACKLIST.delete(ip.trim());
}

/**
 * Retrieve firewall blacklist
 */
export function getBlacklistedIps(): string[] {
  return Array.from(IP_BLACKLIST);
}
