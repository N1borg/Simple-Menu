import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) {
      auditLog({
        action: 'menu_item_create_failed',
        severity: 'warning',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'auth_failed' }
      })
      return auth as NextResponse
    }
    slug = (auth as { slug: string }).slug

    const item = await req.json()
    
    auditLog({
      action: 'menu_item_create_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { itemName: item.name, categoryId: item.category_id }
    })
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(item.slug)) {
      auditLog({
        action: 'menu_item_create_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'demo_mode' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }

    // Input validation & sanitization
    const name = sanitizeString(item.name, 100)
    const description = sanitizeString(item.description, 500)
    const price_one = sanitizeNumber(item.price_one, 0, 10000)
    const is_available = !!item.is_available
    const display_order = sanitizeNumber(item.display_order, 0, 1000)
    const category_id = item.category_id
    const display_style = sanitizeString(item.display_style, 20)
    const vegan = !!item.vegan
    const alcohol_free = !!item.alcohol_free
    
    if (!name || !category_id) {
      auditLog({
        action: 'menu_item_create_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'invalid_input', hasName: !!name, hasCategoryId: !!category_id }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Check subscription limits
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'menu_item_create_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'establishment_not_found' }
      })
      return NextResponse.json({ 
        error: STANDARD_ERRORS.NOT_FOUND
      }, { status: 404 })
    }

    if (!subscription.canCreateMenuItem) {
      const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
      const maxItems = planConfig?.features.maxItems || 0
      auditLog({
        action: 'menu_item_create_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'subscription_limit',
          plan: subscription.plan,
          currentUsage: subscription.usage.menuItemsUsed,
          maxAllowed: maxItems
        }
      })
      return NextResponse.json({ 
        error: STANDARD_ERRORS.SUBSCRIPTION_LIMIT,
        code: 'SUBSCRIPTION_LIMIT_REACHED',
        currentUsage: subscription.usage.menuItemsUsed,
        maxAllowed: maxItems
      }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name,
        description,
        price_one,
        is_available,
        display_order,
        category_id,
        display_style,
        vegan,
        alcohol_free,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      auditLog({ 
        action: 'menu_item_create_failed', 
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          itemName: name,
          categoryId: category_id,
          dbError: error.code,
          dbMessage: error.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }
    
    auditLog({ 
      action: 'menu_item_create_success', 
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        itemId: data.id,
        itemName: name,
        categoryId: category_id,
        plan: subscription.plan,
        usage: subscription.usage 
      } 
    })
    
    return NextResponse.json({ success: true, item: data }, { status: 201 })

  } catch (error) {
    auditLog({
      action: 'menu_item_create_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        error: error instanceof Error ? error.message : 'unknown_error'
      }
    })
    
    return NextResponse.json({ 
      error: STANDARD_ERRORS.SERVER_ERROR 
    }, { status: 500 })
  }
}
