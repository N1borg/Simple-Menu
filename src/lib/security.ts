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

// Simple audit logger (logs to console, can be extended to DB/file)
export function auditLog({ action, user, ip, details }: { action: string, user?: string, ip?: string, details?: any }) {
  // In production, send to a log service or DB
  console.log(`[AUDIT]`, {
    timestamp: new Date().toISOString(),
    action,
    user,
    ip,
    details
  });
}
