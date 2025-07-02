import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { checkRateLimit } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in environment variables')
}

export async function middleware(request: NextRequest) {
  // Set Content Security Policy (CSP) headers for all responses
  const csp = "default-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co https://res.cloudinary.com; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"

  // Only apply middleware to admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Rate limiting (per IP)
    // Next.js does not provide request.ip directly, so we use x-forwarded-for or remote address fallback
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Trop de requêtes, veuillez réessayer plus tard.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Content-Security-Policy': csp
          }
        }
      )
    }
    try {
      // Get token from cookie or Authorization header
      const token = request.cookies.get('admin-session')?.value || 
        request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Non autorisé - Token manquant' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Content-Security-Policy': csp }
          }
        )
      }
      // Verify JWT token
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      )
      if (!payload.slug) {
        return new NextResponse(
          JSON.stringify({ error: 'Token invalide - Slug manquant' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Content-Security-Policy': csp }
          }
        )
      }
      // Block all admin API calls for demo slug
      if (payload.slug === 'demo') {
        return new NextResponse(
          JSON.stringify({ error: 'Modification désactivée sur la page de démonstration.' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json', 'Content-Security-Policy': csp }
          }
        )
      }
      // Authenticated, allow request
      const response = NextResponse.next()
      response.headers.set('Content-Security-Policy', csp)
      return response
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Token invalide' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Content-Security-Policy': csp }
        }
      )
    }
  }
  // For all other routes, set CSP header
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/e/:slug*',
    '/'
  ]
}
