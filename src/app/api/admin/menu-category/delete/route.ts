import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { isValidUUID, isDemoSlug } from '@/lib/validate'
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
        action: 'category_delete_failed',
        severity: 'warning',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Authentication failed' }
      })
      return auth as NextResponse
    }
    slug = (auth as { slug: string }).slug

    const { id, slug: categorySlug } = await req.json()

    auditLog({
      action: 'category_delete_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { categoryId: id, categorySlug }
    })

    // Blocage des modifications en mode démo
    if (isDemoSlug(categorySlug)) {
      auditLog({
        action: 'category_delete_blocked',
        severity: 'info',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction', categorySlug }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }

    // Validation des entrées
    if (!isValidUUID(id)) {
      auditLog({
        action: 'category_delete_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid UUID', invalidId: id }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Supprimer éventuellement tous les éléments de menu dans cette catégorie d'abord
    const { error: deleteItemsError } = await supabase.from('menu_items').delete().eq('category_id', id)
    
    if (deleteItemsError) {
      auditLog({
        action: 'category_delete_items_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          categoryId: id,
          dbError: deleteItemsError.code,
          dbMessage: deleteItemsError.message
        }
      })
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      auditLog({ 
        action: 'category_delete_failed', 
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          categoryId: id,
          dbError: error.code,
          dbMessage: error.message
        } 
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({ 
      action: 'category_delete_success', 
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { categoryId: id } 
    })
    
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    auditLog({
      action: 'category_delete_error',
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
