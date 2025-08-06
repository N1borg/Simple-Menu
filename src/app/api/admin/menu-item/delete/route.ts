import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, isValidUUID, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) {
      auditLog({
        action: 'menu_item_delete_failed',
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
    const { id, slug: reqSlug } = body
    
    auditLog({
      action: 'menu_item_delete_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { itemId: id }
    })
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(reqSlug)) {
      auditLog({
        action: 'menu_item_delete_blocked',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 403,
        details: { reason: 'demo_mode', reqSlug },
        severity: 'info'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }
    
    // Validation de l'entrée
    if (!isValidUUID(id)) {
      auditLog({
        action: 'menu_item_delete_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 400,
        details: { reason: 'invalid_id', id },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    if (!id) {
      auditLog({
        action: 'menu_item_delete_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 400,
        details: { reason: 'missing_id' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) {
      auditLog({
        action: 'menu_item_delete_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 500,
        details: { 
          id,
          dbError: error.code,
          dbMessage: error.message
        },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }
    
    auditLog({
      action: 'menu_item_delete_success',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
      statusCode: 200,
      details: { id },
      severity: 'info'
    })
    
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    auditLog({
      action: 'menu_item_delete_error',
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
