import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isDemoSlug } from '@/lib/validate'
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
        action: 'category_create_failed',
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
    const { name, display_style, display_order, establishment_id, slug: bodySlug } = body
    
    // Blocage des modifications en mode démo
    if (isDemoSlug(bodySlug)) {
      auditLog({
        action: 'category_create_blocked',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 403,
        details: { reason: 'demo_mode', bodySlug },
        severity: 'info'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }

    // Input validation & sanitization
    const safeName = sanitizeString(name, 100)
    const safeStyle = sanitizeString(display_style, 20)
    const safeOrder = sanitizeNumber(display_order, 0, 1000)
    
    if (!safeName || !establishment_id) {
      auditLog({
        action: 'category_create_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 400,
        details: { 
          reason: 'invalid_input',
          hasName: !!safeName,
          hasEstablishmentId: !!establishment_id
        },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Check subscription limits
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'category_create_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 404,
        details: { reason: 'establishment_not_found' },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    if (!subscription.canCreateCategory) {
      auditLog({
        action: 'category_create_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 403,
        details: { 
          reason: 'subscription_limit',
          plan: subscription.plan,
          usage: subscription.usage
        },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SUBSCRIPTION_LIMIT }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: safeName, display_style: safeStyle, display_order: safeOrder, establishment_id, is_available: true }])
      .select()
      .single()

    if (error) {
      auditLog({
        action: 'category_create_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 500,
        details: { 
          name: safeName,
          dbError: error.code,
          dbMessage: error.message
        },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }
    
    auditLog({
      action: 'category_create_success',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
      statusCode: 200,
      details: { 
        categoryId: data.id,
        name: safeName,
        plan: subscription.plan,
        usage: subscription.usage
      },
      severity: 'info'
    })
    
    return NextResponse.json({ success: true, category: data }, { status: 200 })

  } catch (error) {
    auditLog({
      action: 'category_create_error',
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
