import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isDemoSlug } from '@/lib/validate'
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

  const { name, display_style, display_order, establishment_id, slug: bodySlug } = await req.json()
  
  // Blocage des modifications en mode démo
  if (isDemoSlug(bodySlug)) {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }

  // Input validation & sanitization
  const safeName = sanitizeString(name, 100)
  const safeStyle = sanitizeString(display_style, 20)
  const safeOrder = sanitizeNumber(display_order, 0, 1000)
  if (!safeName || !establishment_id) {
    return NextResponse.json({ success: false, error: 'Nom et établissement requis' }, { status: 400 })
  }

  // Check subscription limits
  const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
  if (!subscription) {
    return NextResponse.json({ 
      success: false, 
      error: 'Établissement non trouvé' 
    }, { status: 404 })
  }

  if (!subscription.canCreateCategory) {
    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    const maxCategories = planConfig?.features.maxCategories || 0
    return NextResponse.json({ 
      success: false, 
      error: `Limite de catégories atteinte (${maxCategories} max pour le plan ${planConfig?.name || subscription.plan}). Passez à un plan supérieur pour ajouter plus de catégories.`,
      code: 'SUBSCRIPTION_LIMIT_REACHED',
      currentUsage: subscription.usage.categoriesUsed,
      maxAllowed: maxCategories
    }, { status: 403 })
  }

  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: safeName, display_style: safeStyle, display_order: safeOrder, establishment_id, is_available: true }])
    .select()
    .single()

  if (error) {
    auditLog({ action: 'category_create_failed', ip, details: { name, error } })
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  
  auditLog({ 
    action: 'category_create', 
    ip, 
    details: { 
      name, 
      created: data, 
      plan: subscription.plan,
      usage: subscription.usage 
    } 
  })
  return NextResponse.json({ success: true, category: data }, { status: 200 })
}
