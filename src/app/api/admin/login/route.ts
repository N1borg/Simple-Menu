import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

export async function POST(req: NextRequest) {
  const metadata = getRequestMetadata(req)
  
  try {
    const body = await req.json()
    const { slug, password } = body

    if (!slug || !password) {
      auditLog({ 
        action: 'login_attempt_failed', 
        ...metadata,
        statusCode: 400,
        details: { reason: 'missing_credentials', hasSlug: !!slug, hasPassword: !!password },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }
    
    // Allow demo login but with demo password
    if (slug === 'demo') {
      if (password !== 'demo') {
        auditLog({ 
          action: 'demo_login_failed', 
          ...metadata,
          user: slug,
          statusCode: 401,
          details: { reason: 'invalid_demo_password' },
          severity: 'warning'
        })
        return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 401 })
      }
      
      // Create JWT for demo
      const token = await new SignJWT({ slug: 'demo' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(JWT_SECRET))

      auditLog({ 
        action: 'demo_login_success', 
        ...metadata,
        user: slug,
        statusCode: 200,
        severity: 'info'
      })
      
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 // 24 hours
      })
      return response
    }

    const supabase = await getServerSupabase()

    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('admin_hash')
      .eq('slug', slug)
      .single()

    if (error || !establishment || typeof establishment.admin_hash !== 'string') {
      auditLog({ 
        action: 'login_failed', 
        ...metadata,
        user: slug,
        statusCode: 404,
        details: { reason: 'establishment_not_found', dbError: error?.code },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    const valid = await bcrypt.compare(password, establishment.admin_hash)
    if (!valid) {
      auditLog({ 
        action: 'login_failed', 
        ...metadata,
        user: slug,
        statusCode: 401,
        details: { reason: 'invalid_password' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 401 })
    }

    // Create JWT with slug in payload
    const jwt = await new SignJWT({ slug })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(new TextEncoder().encode(JWT_SECRET))

    auditLog({ 
      action: 'login_success', 
      ...metadata,
      user: slug,
      statusCode: 200,
      severity: 'info'
    })

    const res = NextResponse.json({ success: true })
    res.cookies.set('admin-session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return res

  } catch (error) {
    auditLog({ 
      action: 'login_error', 
      ...metadata,
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
