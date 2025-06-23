import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in environment variables')
}

export async function middleware(request: NextRequest) {
  // Only apply middleware to admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    try {
      // Get token from cookie or Authorization header
      const token = request.cookies.get('admin-session')?.value || 
        request.headers.get('authorization')?.replace('Bearer ', '')
      if (!token) {
        return NextResponse.json(
          { error: 'Non autorisé - Token manquant' },
          { status: 401 }
        )
      }
      // Verify JWT token
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      )
      if (!payload.slug) {
        return NextResponse.json(
          { error: 'Token invalide - Slug manquant' },
          { status: 401 }
        )
      }
      // Authenticated, allow request
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*'
  ]
}
