import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    const { establishmentId, currentPassword, newPassword } = await req.json()
    
    if (!establishmentId || !currentPassword || !newPassword) {
      auditLog({
        action: 'update_password_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing required fields' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Blocage des modifications en mode démo
    if (slug === 'demo') {
      auditLog({
        action: 'update_password_blocked',
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
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('admin_hash')
      .eq('id', establishmentId)
      .single()

    if (error || !establishment || typeof establishment.admin_hash !== 'string') {
      auditLog({
        action: 'update_password_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Establishment not found',
          establishmentId,
          dbError: error?.code,
          dbMessage: error?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    const valid = await bcrypt.compare(currentPassword, establishment.admin_hash)
    if (!valid) {
      auditLog({
        action: 'update_password_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid current password' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 401 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ admin_hash: newHash })
      .eq('id', establishmentId)

    if (updateError) {
      auditLog({
        action: 'update_password_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Database update failed',
          establishmentId,
          dbError: updateError.code,
          dbMessage: updateError.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'update_password_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { establishmentId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    auditLog({
      action: 'update_password_error',
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
