/**
 * KrishiSeva Frontend Security Utilities
 * Section 6: Frontend Security (Sanitization, URL safety, Open-Redirect defenses)
 */

/**
 * Strips HTML tags, script elements, inline event handlers, and dangerous pseudoprotocols
 * from user-generated content strings before displaying them in UI views.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  
  return String(input)
    // Strip script and style tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip HTML tags
    .replace(/<[^>]+>/g, '')
    // Strip javascript: pseudo-protocol and any expressions
    .replace(/javascript\s*:[^\s"'>]*/gi, '')
    .replace(/javascript\s*:/gi, '')
    // Strip dangerous evaluation invocations
    .replace(/\b(?:eval|alert|prompt|confirm)\s*\([^)]*\)/gi, '')
    // Strip data: text/html pseudo-protocol
    .replace(/data\s*:\s*text\/html/gi, '')
    // Strip common event handlers if remaining
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validates that an external or internal URL uses only safe web protocols.
 * Blocks dangerous schemes like `javascript:`, `data:`, `vbscript:`, `file:`.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Relative paths are safe
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Anchor hashes are safe
  if (trimmed.startsWith('#')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, 'https://krishiseva.gov.in');
    const safeProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
    return safeProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Open Redirect Defense:
 * Validates target redirect URLs to prevent attackers from executing open-redirect attacks.
 * - Disallows protocol-relative URLs (e.g. `//attacker.com`)
 * - Disallows dangerous pseudoprotocols (`javascript:`, `data:`)
 * - Disallows unauthorized external hostnames unless explicitly permitted.
 */
export function validateRedirectUrl(
  targetUrl: string | null | undefined,
  fallback: string = '/'
): string {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return fallback;
  }

  const trimmed = targetUrl.trim();

  // Reject empty string or newline / control character injection
  if (!trimmed || /[\r\n\t\0]/.test(trimmed)) {
    return fallback;
  }

  // Reject protocol-relative URLs like `//evil.com`
  if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) {
    return fallback;
  }

  // Reject dangerous schemes
  if (/^(?:javascript|data|vbscript|file):/i.test(trimmed)) {
    return fallback;
  }

  // If it's a valid relative path starting with a single '/'
  if (trimmed.startsWith('/') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // For absolute URLs, check if origin matches current location or trusted gov domains
  try {
    const parsed = new URL(trimmed);
    const trustedDomains = [
      'krishiseva.gov.in',
      'www.krishiseva.gov.in',
      'localhost',
      '127.0.0.1',
    ];

    if (typeof window !== 'undefined' && window.location) {
      if (parsed.origin === window.location.origin) {
        return trimmed;
      }
    }

    const hostname = parsed.hostname.toLowerCase();
    const isTrusted = trustedDomains.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`) || hostname.endsWith('.gov.in')
    );

    if (isTrusted && (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && hostname === 'localhost'))) {
      return trimmed;
    }
  } catch {
    // Malformed URL
  }

  return fallback;
}
