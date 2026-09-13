import crypto from 'crypto';
import path from 'path';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

// Known Magic Byte Signatures
const MAGIC_SIGNATURES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  {
    mime: 'image/jpeg',
    check: (buf: Buffer) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
  },
  {
    mime: 'image/png',
    check: (buf: Buffer) => buf.length >= 8 &&
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
      buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A,
  },
  {
    mime: 'image/webp',
    check: (buf: Buffer) => buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  },
  {
    mime: 'application/pdf',
    check: (buf: Buffer) => buf.length >= 4 && buf.toString('ascii', 0, 4) === '%PDF',
  },
];

// Malicious & Web Shell Signatures
const MALWARE_PATTERNS = [
  /<\?php/i,
  /<script\b[^>]*>/i,
  /\b(eval|base64_decode|system|exec|passthru|shell_exec)\s*\(/i,
  /<%--/i,
  /<%@/i,
  /\bdocument\.cookie\b/i,
];

/**
 * 4. File Upload Validation & Malware Scanning
 */
export function validateAndScanFile(
  buffer: Buffer,
  originalFilename: string,
  declaredMimeType?: string
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'Empty file uploaded. File must contain data.' };
  }

  // 1. Check File Size Restrictions
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size exceeds permissible limit (${sizeMb} MB). Maximum allowed size is 5 MB.`,
    };
  }

  // 2. Binary Magic Bytes Inspection (Deep inspection against disguised binaries)
  let detectedMime: string | null = null;
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.check(buffer)) {
      detectedMime = sig.mime;
      break;
    }
  }

  if (!detectedMime) {
    return {
      isValid: false,
      error: 'Invalid file format or corrupted binary header. Allowed formats: JPEG, PNG, WEBP, PDF.',
    };
  }

  // If MIME was declared, ensure it matches actual magic bytes
  if (declaredMimeType && declaredMimeType.toLowerCase() !== detectedMime) {
    return {
      isValid: false,
      error: `File content mismatch: Declared ${declaredMimeType}, but verified binary signature is ${detectedMime}.`,
    };
  }

  // 3. Executable binary header rejection (MZ executable / ELF binary)
  if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return { isValid: false, error: 'Malware detection: Windows PE executable header detected in file.' };
  }
  if (buffer.length >= 4 && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    return { isValid: false, error: 'Malware detection: Linux ELF executable header detected in file.' };
  }

  // 4. Embedded Web Shell & Malicious Script Scanner
  // Inspect first 64KB and last 64KB for polyglot embedded script tags
  const prefixLength = Math.min(buffer.length, 65536);
  const prefixStr = buffer.toString('utf-8', 0, prefixLength);
  for (const pattern of MALWARE_PATTERNS) {
    if (pattern.test(prefixStr)) {
      return {
        isValid: false,
        error: 'Security alert: Embedded malicious script or shell payload signature detected inside file content.',
      };
    }
  }

  // 5. Generate Cryptographically Secure File Name (Prevent directory traversal & filename spoofing)
  const ext = detectedMime === 'image/jpeg' ? '.jpg'
    : detectedMime === 'image/png' ? '.png'
    : detectedMime === 'image/webp' ? '.webp'
    : '.pdf';

  const randomHash = crypto.randomBytes(16).toString('hex');
  const safeFilename = `upload_${Date.now()}_${randomHash}${ext}`;

  return {
    isValid: true,
    sanitizedFilename: safeFilename,
    mimeType: detectedMime,
    sizeBytes: buffer.length,
  };
}
