// Input validation and sanitization helpers
export function sanitizeString(str: any, maxLength = 255): string {
  if (typeof str !== 'string') return ''
  return str.trim().replace(/[<>]/g, '').slice(0, maxLength)
}

export function sanitizeNumber(num: any, min = 0, max = 1e6): number {
  const n = Number(num)
  if (isNaN(n)) return min
  return Math.max(min, Math.min(max, n))
}

export function isValidUUID(id: any): boolean {
  return typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id)
}

export function isDemoSlug(slug: any): boolean {
  return typeof slug === 'string' && slug.toLowerCase() === 'demo'
}
