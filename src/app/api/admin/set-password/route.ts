import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { requireSecureAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    // Verify admin authentication
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    const { newPassword } = await req.json()
    
    if (!newPassword) {
      auditLog({
        action: 'set_password_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing new password' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    if (newPassword.length < 6) {
      auditLog({
        action: 'set_password_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Password too short', length: newPassword.length }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Block modifications in demo mode
    if (slug === 'demo') {
      auditLog({
        action: 'set_password_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    // Get establishment by slug to ensure user can only update their own establishment
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, admin_hash')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      auditLog({
        action: 'set_password_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Establishment not found',
          dbError: error?.code,
          dbMessage: error?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10)

    // Update the password
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ admin_hash: newHash })
      .eq('id', establishment.id)

    if (updateError) {
      auditLog({
        action: 'set_password_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Database update failed',
          dbError: updateError.code,
          dbMessage: updateError.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    // Log successful password change
    auditLog({
      action: 'admin_password_set_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { context: 'authenticated_session' }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    auditLog({
      action: 'set_password_error',
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
