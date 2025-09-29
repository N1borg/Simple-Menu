import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) {
      auditLog({
        action: 'category_update_failed',
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

    const { id, name, display_style, display_order, is_available, vegan, alcohol_free, slug: bodySlug } = await req.json()
    
    auditLog({
      action: 'category_update_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { categoryId: id, name, bodySlug }
    })
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(bodySlug)) {
      auditLog({
        action: 'category_update_blocked',
        severity: 'info',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction', bodySlug }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }

    // Get establishment subscription info
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'category_update_failed',
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
      if (is_available === false || vegan === true || alcohol_free === true) {
        auditLog({
          action: 'category_update_blocked',
          severity: 'warning',
          user: slug,
          ip: requestMetadata.ip,
          userAgent: requestMetadata.userAgent,
          method: requestMetadata.method,
          url: requestMetadata.url,
          details: { 
            reason: 'Feature restricted for plan',
            plan: subscription.plan,
            attemptedFeatures: { is_available, vegan, alcohol_free }
          }
        })
        return NextResponse.json({ 
          error: STANDARD_ERRORS.FORBIDDEN,
          code: 'FEATURE_NOT_AVAILABLE'
        }, { status: 403 })
      }
    }

    // Validation et assainissement des entrées
    if (!isValidUUID(id)) {
      auditLog({
        action: 'category_update_failed',
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
    
    const safeName = sanitizeString(name, 100)
    const safeStyle = sanitizeString(display_style, 20)
    const safeOrder = sanitizeNumber(display_order, 0, 1000)
    
    // Force restrictions for non-Pro/Premium plans (reuse isProOrPremium from above)
    const safeAvailable = isProOrPremium ? (typeof is_available === 'boolean' ? is_available : true) : true
    const safeVegan = isProOrPremium ? (typeof vegan === 'boolean' ? vegan : false) : false
    const safeAlcoholFree = isProOrPremium ? (typeof alcohol_free === 'boolean' ? alcohol_free : false) : false
    const supabase = await getServerSupabase()

    if (!id) {
      auditLog({ 
        action: 'category_update_failed', 
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

    const { error } = await supabase
      .from('categories')
      .update({ 
        name: safeName, 
        display_style: safeStyle, 
        display_order: safeOrder, 
        is_available: safeAvailable,
        vegan: safeVegan,
        alcohol_free: safeAlcoholFree
      })
      .eq('id', id)

    if (error) {
      auditLog({ 
        action: 'category_update_failed', 
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
      action: 'category_update_success', 
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        categoryId: id, 
        name: safeName, 
        display_style: safeStyle, 
        display_order: safeOrder, 
        is_available: safeAvailable, 
        vegan: safeVegan, 
        alcohol_free: safeAlcoholFree,
        plan: subscription.plan
      } 
    })
    
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    auditLog({
      action: 'category_update_error',
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
