import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    const { id, image_url } = await req.json()
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      auditLog({
        action: 'menu_item_image_update_blocked',
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

    // Get establishment subscription info and check plan
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'menu_item_image_update_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Establishment not found or invalid plan' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Check if plan allows image management (Pro and Premium only)
    if (!(subscription.plan === 'pro' || subscription.plan === 'premium')) {
      auditLog({
        action: 'menu_item_image_update_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Feature restricted for plan', plan: subscription.plan }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    if (!id) {
      auditLog({
        action: 'menu_item_image_update_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing ID' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const safeImageUrl = sanitizeString(image_url, 500)
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: safeImageUrl })
      .eq('id', id)

    if (error) {
      auditLog({
        action: 'menu_item_image_update_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          itemId: id,
          dbError: error.code,
          dbMessage: error.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'menu_item_image_update_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        itemId: id,
        imageUrl: safeImageUrl,
        plan: subscription.plan
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    auditLog({
      action: 'menu_item_image_update_error',
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

export async function DELETE(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    const { id } = await req.json()
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      auditLog({
        action: 'menu_item_image_delete_blocked',
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

    // Get establishment subscription info and check plan
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'menu_item_image_delete_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Establishment not found or invalid plan' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Check if plan allows image management (Pro and Premium only)
    if (subscription.plan === 'essentiel') {
      auditLog({
        action: 'menu_item_image_delete_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Feature restricted for plan', plan: subscription.plan }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    if (!id) {
      auditLog({
        action: 'menu_item_image_delete_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing ID' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: null })
      .eq('id', id)

    if (error) {
      auditLog({
        action: 'menu_item_image_delete_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          itemId: id,
          dbError: error.code,
          dbMessage: error.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'menu_item_image_delete_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        itemId: id,
        plan: subscription.plan
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    auditLog({
      action: 'menu_item_image_delete_error',
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
