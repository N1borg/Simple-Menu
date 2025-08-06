import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'
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
    const item = await req.json()

    // Blocage des modifications en mode démo
    if (isDemoSlug(item.slug)) {
      auditLog({
        action: 'menu_item_update_blocked',
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

    // Get establishment subscription info
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'menu_item_update_failed',
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

    // Check for unauthorized parameter modifications before processing
    const isProOrPremium = subscription.plan === 'pro' || subscription.plan === 'premium'
    if (!isProOrPremium) {
      // Block attempts to set unavailable or dietary attributes for essentiel plans
      if (item.is_available === false || item.vegan === true || item.alcohol_free === true) {
        auditLog({
          action: 'menu_item_update_blocked',
          severity: 'warning',
          user: slug,
          ip: requestMetadata.ip,
          userAgent: requestMetadata.userAgent,
          method: requestMetadata.method,
          url: requestMetadata.url,
          details: { 
            reason: 'Feature restricted for plan',
            plan: subscription.plan,
            attemptedFeatures: { is_available: item.is_available, vegan: item.vegan, alcohol_free: item.alcohol_free }
          }
        })
        return NextResponse.json({ 
          error: STANDARD_ERRORS.FORBIDDEN,
          code: 'FEATURE_NOT_AVAILABLE'
        }, { status: 403 })
      }
    }

    // Input validation & sanitization
    if (!isValidUUID(item.id)) {
      auditLog({
        action: 'menu_item_update_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid UUID', invalidId: item.id }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const name = sanitizeString(item.name, 100)
    const description = sanitizeString(item.description, 500)
    const price_one = sanitizeNumber(item.price_one, 0, 10000)
    const display_order = sanitizeNumber(item.display_order, 0, 1000)
    const category_id = item.category_id
    const display_style = sanitizeString(item.display_style, 20)
    
    // Force restrictions for non-Pro/Premium plans (reuse isProOrPremium from above)
    const is_available = isProOrPremium ? !!item.is_available : true
    const vegan = isProOrPremium ? !!item.vegan : false
    const alcohol_free = isProOrPremium ? !!item.alcohol_free : false
    const supabase = await getServerSupabase()

    const { error } = await supabase
      .from('menu_items')
      .update({
        name,
        description,
        price_one,
        is_available,
        display_order,
        category_id,
        display_style,
        vegan,
        alcohol_free,
      })
      .eq('id', item.id)

    if (error) {
      auditLog({
        action: 'menu_item_update_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          itemId: item.id,
          dbError: error.code,
          dbMessage: error.message
        }
      })
      
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'menu_item_update_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        itemId: item.id,
        name,
        description,
        price_one,
        is_available,
        display_order,
        category_id,
        display_style,
        vegan,
        alcohol_free,
        plan: subscription.plan
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    auditLog({
      action: 'menu_item_update_error',
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
