import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logAuditAction } from './auth';

/**
 * Uniform Validation Result Handler
 * Returns 400 Bad Request with standardized error details
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
      value: (err as any).value,
    }));

    return res.status(400).json({
      error: 'Input validation failed',
      details: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }
  next();
}

/**
 * 6. URL Parameter Validation Middleware
 * Enforces safe alphanumeric format and rejects path traversal (../) and script injection
 */
export function validateParamId(paramName: string = 'id') {
  return [
    param(paramName)
      .trim()
      .notEmpty().withMessage(`${paramName} parameter is required`)
      .isLength({ min: 1, max: 64 }).withMessage(`${paramName} length must be between 1 and 64 characters`)
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage(`${paramName} contains invalid characters; only letters, digits, underscores, and hyphens are allowed`)
      .custom((value) => {
        if (value.includes('..') || value.includes('/') || value.includes('\\')) {
          throw new Error('Path traversal sequence detected in URL parameter');
        }
        return true;
      }),
    handleValidationErrors,
  ];
}

/**
 * 3. Parameterized Database Queries & SQL Injection Detection
 * Scans incoming request bodies, queries, and params for suspicious SQL injection syntax
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|EXEC|EXECUTE)\b)/i,
  /(\bOR\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
  /(--|\/\*|\*\/|@@|CHAR\(|NCHAR\()/i,
  /(\bWAITFOR\s+DELAY\b)/i,
  /(;\s*(DROP|SELECT|INSERT|UPDATE|DELETE)\b)/i,
];

function checkStringForSqlInjection(val: string): boolean {
  if (typeof val !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(regex => regex.test(val));
}

function scanObjectForSql(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && checkStringForSqlInjection(val)) {
      return `${key}: "${val.substring(0, 30)}..."`;
    }
    if (typeof val === 'object') {
      const nested = scanObjectForSql(val);
      if (nested) return nested;
    }
  }
  return null;
}

export function detectSqlInjection(req: Request, res: Response, next: NextFunction) {
  // Check URL params
  const paramViolation = scanObjectForSql(req.params);
  if (paramViolation) {
    logAuditAction(req.user?.id, req.user?.role || 'anonymous', 'SECURITY_SQL_INJECTION_BLOCKED', 'params', paramViolation);
    return res.status(400).json({ error: 'Malicious SQL pattern detected in URL parameters. Request blocked.' });
  }

  // Check Query string
  const queryViolation = scanObjectForSql(req.query);
  if (queryViolation) {
    logAuditAction(req.user?.id, req.user?.role || 'anonymous', 'SECURITY_SQL_INJECTION_BLOCKED', 'query', queryViolation);
    return res.status(400).json({ error: 'Malicious SQL pattern detected in query string. Request blocked.' });
  }

  // Check Request body
  const bodyViolation = scanObjectForSql(req.body);
  if (bodyViolation) {
    logAuditAction(req.user?.id, req.user?.role || 'anonymous', 'SECURITY_SQL_INJECTION_BLOCKED', 'body', bodyViolation);
    return res.status(400).json({ error: 'Malicious SQL pattern detected in request body. Request blocked.' });
  }

  next();
}

/**
 * 1. Server-Side Input Validation & 2. Length Restrictions
 * Specific validation rules for key domain operations
 */

export const validateBookingInput = [
  body('slot_id')
    .trim()
    .notEmpty().withMessage('slot_id is required')
    .isLength({ min: 1, max: 64 }).withMessage('slot_id length must not exceed 64 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('slot_id must contain only letters, numbers, hyphens, and underscores'),

  body('centre_id')
    .trim()
    .notEmpty().withMessage('centre_id is required')
    .isLength({ min: 1, max: 64 }).withMessage('centre_id length must not exceed 64 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('centre_id must contain only letters, numbers, hyphens, and underscores'),

  body('crop_type')
    .trim()
    .notEmpty().withMessage('crop_type is required')
    .isIn(['wheat', 'paddy', 'maize', 'mustard', 'gram', 'cotton', 'soybean', 'barley', 'sunflower', 'groundnut'])
    .withMessage('Invalid crop_type. Accepted crops: wheat, paddy, maize, mustard, gram, cotton, soybean, barley, sunflower, groundnut'),

  body('expected_quantity_kg')
    .isFloat({ min: 1.0, max: 50000.0 })
    .withMessage('expected_quantity_kg must be a positive number between 1.0 kg and 50,000.0 kg (50 MT)'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('notes must not exceed 500 characters')
    .escape(),

  handleValidationErrors,
];

export const validateGrievanceInput = [
  body('centre_id')
    .trim()
    .notEmpty().withMessage('centre_id is required')
    .isLength({ min: 1, max: 64 }).withMessage('centre_id must not exceed 64 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('category is required')
    .isIn(['queue_delay', 'weighbridge_discrepancy', 'payment_issue', 'officer_conduct', 'portal_error', 'quality_grade_dispute', 'other'])
    .withMessage('Invalid grievance category'),

  body('subject')
    .trim()
    .notEmpty().withMessage('subject is required')
    .isLength({ min: 5, max: 200 }).withMessage('subject length must be between 5 and 200 characters')
    .escape(),

  body('description')
    .trim()
    .notEmpty().withMessage('description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('description length must be between 10 and 2000 characters')
    .escape(),

  body('booking_id')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 64 }).withMessage('booking_id must not exceed 64 characters'),

  handleValidationErrors,
];

export const validateFarmerProfileInput = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('name contains invalid characters'),

  body('aadhaar_last4')
    .optional()
    .trim()
    .matches(/^\d{4}$/).withMessage('aadhaar_last4 must be exactly 4 digits'),

  body('land_area_acres')
    .optional()
    .isFloat({ min: 0.1, max: 1000.0 }).withMessage('land_area_acres must be between 0.1 and 1000.0 acres'),

  body('village')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('village must be between 2 and 100 characters'),

  body('district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('district must be between 2 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('state must be between 2 and 100 characters'),

  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/).withMessage('pincode must be exactly 6 digits'),

  body('bank_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('bank_name must be between 2 and 100 characters'),

  body('bank_account_last4')
    .optional()
    .trim()
    .matches(/^\d{4}$/).withMessage('bank_account_last4 must be exactly 4 digits'),

  body('ifsc_code')
    .optional()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('ifsc_code must be in valid RBI format (e.g. SBIN0001234)'),

  handleValidationErrors,
];

export const validateDateQuery = [
  query('date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date parameter must be in YYYY-MM-DD format')
    .custom((val) => {
      const parsed = Date.parse(val);
      if (isNaN(parsed)) throw new Error('Invalid calendar date');
      return true;
    }),
  handleValidationErrors,
];
