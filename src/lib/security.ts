// Simple in-memory rate limiter (per IP)
const rateLimitStore = new Map();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per IP

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { count: 1, start: now };
    rateLimitStore.set(ip, entry);
    return true;
  }
  if (now - entry.start > WINDOW_SIZE) {
    // Reset window
    entry.count = 1;
    entry.start = now;
    return true;
  }
  if (entry.count >= MAX_REQUESTS) {
    return false;
  }
  entry.count++;
  return true;
}

// Enhanced audit logger with comprehensive security logging
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  details?: any;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

export function auditLog({ 
  action, 
  user, 
  ip, 
  userAgent,
  method,
  url,
  statusCode,
  details,
  severity = 'info'
}: {
  action: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  details?: any;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}) {
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    action,
    user,
    ip,
    userAgent,
    method,
    url,
    statusCode,
    details,
    severity
  }
  
  // Always log critical and error events
  if (severity === 'critical' || severity === 'error') {
    console.error(`[AUDIT][${severity.toUpperCase()}]`, logEntry)
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT][${severity.toUpperCase()}]`, logEntry)
  }
  
  // In production, this would send to a log service or database
  // Could integrate with services like Winston, Pino, or external logging services
}

// Helper function to extract request metadata
export function getRequestMetadata(req: Request) {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        req.headers.get('x-real-ip') || 
        'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    method: req.method,
    url: req.url
  };
}

// Standard error responses to avoid information leakage
export const STANDARD_ERRORS = {
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Opération non autorisée',
  NOT_FOUND: 'Ressource non trouvée',
  BAD_REQUEST: 'Requête invalide',
  RATE_LIMITED: 'Trop de requêtes',
  SERVER_ERROR: 'Erreur interne du serveur',
  DEMO_BLOCKED: 'Modification désactivée (mode démo)',
  INVALID_INPUT: 'Données invalides',
  SUBSCRIPTION_LIMIT: 'Limite d\'abonnement atteinte'
} as const;
