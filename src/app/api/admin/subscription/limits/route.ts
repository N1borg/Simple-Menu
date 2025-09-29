import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function GET(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) {
      auditLog({
        action: 'subscription_limits_failed',
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

    // Block demo requests
    if (slug === 'demo') {
      auditLog({
        action: 'subscription_limits_demo',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        user: slug,
        statusCode: 200,
        details: { reason: 'demo_response' },
        severity: 'info'
      })
      return NextResponse.json({
        plan: 'pro',
        usage: {
          categoriesUsed: 5,
          menuItemsUsed: 25,
          lastUpdated: new Date(),
        },
        canCreateCategory: true,
        canCreateMenuItem: true,
        categoriesRemaining: 10,
        menuItemsRemaining: 175,
      })
    }

    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    
    if (!subscription) {
      auditLog({
        action: 'subscription_limits_failed',
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

    const limits = await SubscriptionServerService.validateUsageLimits(subscription.establishmentId)

    auditLog({
      action: 'subscription_limits_success',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
      statusCode: 200,
      details: { 
        plan: limits.plan,
        categoriesUsed: limits.usage.categoriesUsed,
        menuItemsUsed: limits.usage.menuItemsUsed
      },
      severity: 'info'
    })

    return NextResponse.json({
      plan: limits.plan,
      usage: limits.usage,
      canCreateCategory: limits.canCreateCategory,
      canCreateMenuItem: limits.canCreateMenuItem,
      categoriesRemaining: limits.categoriesRemaining,
      menuItemsRemaining: limits.menuItemsRemaining,
    })

  } catch (error) {
    auditLog({
      action: 'subscription_limits_error',
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
