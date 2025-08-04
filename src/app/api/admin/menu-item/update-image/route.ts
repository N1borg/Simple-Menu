import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  try {
    const { id, image_url } = await req.json()
    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
    }

    // Get establishment subscription info and check plan
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      return NextResponse.json({ error: 'Établissement introuvable ou plan invalide.' }, { status: 404 })
    }

    // Check if plan allows image management (Pro and Premium only)
    if (!(subscription.plan === 'pro' || subscription.plan === 'premium')) {
      return NextResponse.json({ 
        error: 'La gestion d\'images est disponible uniquement pour les plans Pro et Premium. Passez à un plan supérieur pour utiliser cette fonctionnalité.' 
      }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const safeImageUrl = sanitizeString(image_url, 500)
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: safeImageUrl })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Audit log: action, user, details
    await auditLog({
      action: 'update',
      user: slug,
      details: 'Item Image updated via admin API.'
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  try {
    const { id } = await req.json()
    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
    }

    // Get establishment subscription info and check plan
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      return NextResponse.json({ error: 'Établissement introuvable ou plan invalide.' }, { status: 404 })
    }

    // Check if plan allows image management (Pro and Premium only)
    if (subscription.plan === 'essentiel') {
      return NextResponse.json({ 
        error: 'La gestion d\'images est disponible uniquement pour les plans Pro et Premium. Passez à un plan supérieur pour utiliser cette fonctionnalité.' 
      }, { status: 403 })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: null })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await auditLog({
      action: 'delete',
      user: slug,
      details: 'Item Image deleted via admin API.'
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
