import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) {
      auditLog({
        action: 'logout_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        statusCode: 401,
        details: { reason: 'auth_failed' },
        severity: 'warning'
      })
      return auth as NextResponse
    }
    
    slug = (auth as { slug: string }).slug
    
    const body = await req.json()
    const { slug: bodySlug } = body
    
    if (!bodySlug) {
      auditLog({
        action: 'logout_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 400,
        details: { reason: 'missing_slug' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }
    
    // Blocage des modifications en mode démo
    if (bodySlug === 'demo') {
      auditLog({
        action: 'logout_blocked',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 403,
        details: { reason: 'demo_mode' },
        severity: 'info'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }
    
    auditLog({
      action: 'logout_success',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
      statusCode: 200,
      details: { redirectSlug: bodySlug },
      severity: 'info'
    })
    
    // Clear the admin session cookie
    const response = NextResponse.json({ success: true, redirectUrl: `/e/${bodySlug}/admin` })
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    
    return response

  } catch (error) {
    auditLog({
      action: 'logout_error',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
      statusCode: 500,
      details: { 
        error: error instanceof Error ? error.message : 'unknown_error',
        stack: error instanceof Error ? error.stack : undefined
      },
      severity: 'error'
    })
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
