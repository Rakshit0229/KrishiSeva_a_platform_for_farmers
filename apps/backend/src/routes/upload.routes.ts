import { Router, Request, Response } from 'express';
import { validateAndScanFile } from '../services/upload.service';
import { authMiddleware, logAuditAction } from '../middleware/auth';

const router = Router();

// In-memory store for validated uploads
export const uploadedFiles: Map<string, {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  createdAt: string;
  dataBase64?: string;
}> = new Map();

/**
 * POST /api/upload/crop-sample
 * Validates crop photos submitted for vision AI assessment
 */
router.post('/crop-sample', authMiddleware, (req: Request, res: Response) => {
  const { filename = 'sample.jpg', fileBase64, mimeType } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: 'fileBase64 data is required for upload' });
  }

  // Strip base64 prefix if present (e.g. data:image/jpeg;base64,...)
  const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  const scanResult = validateAndScanFile(buffer, filename, mimeType);
  if (!scanResult.isValid) {
    logAuditAction(req.user?.id, req.user?.role, 'SECURITY_MALICIOUS_UPLOAD_BLOCKED', 'uploads', filename, null, { error: scanResult.error });
    return res.status(400).json({
      error: scanResult.error,
      rejected: true,
      security_check: 'Magic bytes, malware scan, and size limit verification failed',
    });
  }

  // Store validated file record
  const fileId = scanResult.sanitizedFilename!;
  uploadedFiles.set(fileId, {
    filename: fileId,
    mimeType: scanResult.mimeType!,
    sizeBytes: scanResult.sizeBytes!,
    uploadedBy: req.user!.id,
    createdAt: new Date().toISOString(),
  });

  logAuditAction(req.user?.id, req.user?.role, 'FILE_UPLOAD_SUCCESS', 'uploads', fileId);

  return res.status(201).json({
    message: 'File verified and stored securely',
    filename: fileId,
    mimeType: scanResult.mimeType,
    sizeBytes: scanResult.sizeBytes,
    url: `/api/upload/files/${fileId}`,
    security_verified: true,
  });
});

/**
 * GET /api/upload/files/:id
 * Securely serves validated files with strict headers preventing script execution
 */
router.get('/files/:id', (req: Request, res: Response) => {
  const file = uploadedFiles.get(req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'Requested file not found or expired' });
  }

  // Security Headers: Prevent browser from MIME-sniffing or executing as HTML/script
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

  return res.json({
    file_id: file.filename,
    mime_type: file.mimeType,
    size_bytes: file.sizeBytes,
    created_at: file.createdAt,
    status: 'clean_verified',
  });
});

export default router;
