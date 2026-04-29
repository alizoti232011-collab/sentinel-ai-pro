/**
 * Enterprise Security Module
 * Includes: encryption, rate limiting, CORS, input validation, audit logging
 */

import crypto from 'crypto';

// ============================================================================
// 1. PASSWORD HASHING (bcrypt equivalent using Node crypto)
// ============================================================================

/**
 * Hash password using PBKDF2 (secure alternative to bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(32).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

// ============================================================================
// 2. JWT TOKEN MANAGEMENT
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

/**
 * Generate JWT token
 */
export function generateJWT(userId: string, email: string, role: 'user' | 'admin' = 'user'): string {
  const payload: JWTPayload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  // Simple JWT encoding (in production, use jsonwebtoken library)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64').toString());

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// 3. RATE LIMITING
// ============================================================================

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Check rate limit
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowSeconds * 1000 };
    return true;
  }

  const entry = rateLimitStore[key];

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowSeconds * 1000;
    return true;
  }

  entry.count++;
  return entry.count <= limit;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(identifier: string): { remaining: number; resetTime: number } {
  const entry = rateLimitStore[identifier];
  if (!entry) {
    return { remaining: 100, resetTime: Date.now() + 60000 };
  }

  return {
    remaining: Math.max(0, 100 - entry.count),
    resetTime: entry.resetTime,
  };
}

// ============================================================================
// 4. INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate input length
 */
export function validateInputLength(input: string, maxLength: number): boolean {
  return input.length <= maxLength;
}

// ============================================================================
// 5. ENCRYPTION/DECRYPTION
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================================================
// 6. AUDIT LOGGING
// ============================================================================

interface AuditLog {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}

const auditLogs: AuditLog[] = [];

/**
 * Log audit event
 */
export function logAudit(
  userId: string,
  action: string,
  resource: string,
  details: any,
  ipAddress: string,
  userAgent: string,
  status: 'success' | 'failure' = 'success'
): void {
  const log: AuditLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    details,
    ipAddress,
    userAgent,
    status,
  };

  auditLogs.push(log);

  // Keep only last 10,000 logs in memory (in production, store in database)
  if (auditLogs.length > 10000) {
    auditLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', log);
  }
}

/**
 * Get audit logs
 */
export function getAuditLogs(userId?: string, limit: number = 100): AuditLog[] {
  let logs = auditLogs;

  if (userId) {
    logs = logs.filter((log) => log.userId === userId);
  }

  return logs.slice(-limit).reverse();
}

// ============================================================================
// 7. SECURITY HEADERS
// ============================================================================

/**
 * Get security headers for Express
 */
export function getSecurityHeaders() {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

// ============================================================================
// 8. CORS CONFIGURATION
// ============================================================================

/**
 * Get CORS options
 */
export function getCORSOptions() {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://sentinel-ai.com',
    process.env.VITE_FRONTEND_URL,
  ].filter(Boolean);

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

// ============================================================================
// 9. CSRF TOKEN GENERATION
// ============================================================================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}
