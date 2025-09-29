import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const body = await req.json()
    const { slug: requestSlug, password } = body
    slug = requestSlug || 'unknown'

    if (!slug) {
      auditLog({
        action: 'login_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing slug' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    if (!password) {
      auditLog({
        action: 'login_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing password' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Get establishment by slug
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('*')
      .eq('slug', slug)
      .single()

    if (establishmentError || !establishment) {
      auditLog({
        action: 'login_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Establishment not found' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Check password
    let isValidPassword = false
    if (password && establishment.admin_hash) {
      isValidPassword = await bcrypt.compare(password, establishment.admin_hash)
    }

    if (!isValidPassword) {
      auditLog({
        action: 'login_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid password' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        establishmentId: establishment.id,
        slug: establishment.slug,
        email: establishment.email
      },
      JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    auditLog({
      action: 'login_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        establishmentId: establishment.id,
        email: establishment.email,
        plan: establishment.plan
      }
    })

    return NextResponse.json({
      success: true,
      token,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        email: establishment.email,
        plan: establishment.plan,
        plan_status: establishment.plan_status,
        is_active: establishment.is_active,
        trial_ends_at: establishment.trial_ends_at
      }
    })

  } catch (error) {
    auditLog({
      action: 'login_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
