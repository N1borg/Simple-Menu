import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  const item = await req.json()
  
  // Blocage des modifications en mode démo
  if (isDemoSlug(item.slug)) {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }

  // Input validation & sanitization
  const name = sanitizeString(item.name, 100)
  const description = sanitizeString(item.description, 500)
  const price = sanitizeNumber(item.price, 0, 10000)
  const is_available = !!item.is_available
  const display_order = sanitizeNumber(item.display_order, 0, 1000)
  const category_id = item.category_id
  const display_style = sanitizeString(item.display_style, 20)
  
  if (!name || !category_id) {
    return NextResponse.json({ success: false, error: 'Nom et catégorie requis' }, { status: 400 })
  }

  // Check subscription limits
  const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
  if (!subscription) {
    return NextResponse.json({ 
      success: false, 
      error: 'Établissement non trouvé' 
    }, { status: 404 })
  }

  if (!subscription.canCreateMenuItem) {
    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    const maxItems = planConfig?.features.maxItems || 0
    return NextResponse.json({ 
      success: false, 
      error: `Limite d'éléments atteinte (${maxItems} max pour le plan ${planConfig?.name || subscription.plan}). Passez à un plan supérieur pour ajouter plus d'éléments.`,
      code: 'SUBSCRIPTION_LIMIT_REACHED',
      currentUsage: subscription.usage.menuItemsUsed,
      maxAllowed: maxItems
    }, { status: 403 })
  }

  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name,
      description,
      price,
      is_available,
      display_order,
      category_id,
      display_style,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    auditLog({ action: 'menu_item_create_failed', ip, details: { item, error } })
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  
  auditLog({ 
    action: 'menu_item_create', 
    ip, 
    details: { 
      item, 
      created: data, 
      plan: subscription.plan,
      usage: subscription.usage 
    } 
  })
  return NextResponse.json({ success: true, item: data }, { status: 201 })
}
