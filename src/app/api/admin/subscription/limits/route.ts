import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    const slug = (auth as { slug: string }).slug

    // Block demo requests
    if (slug === 'demo') {
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
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    const limits = await SubscriptionServerService.validateUsageLimits(subscription.establishmentId)

    return NextResponse.json({
      plan: limits.plan,
      usage: limits.usage,
      canCreateCategory: limits.canCreateCategory,
      canCreateMenuItem: limits.canCreateMenuItem,
      categoriesRemaining: limits.categoriesRemaining,
      menuItemsRemaining: limits.menuItemsRemaining,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
