import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, isDemoSlug } from '@/lib/validate'
import { requireSecureAdminAuth } from '@/lib/auth'
import { SubscriptionServerService } from '@/lib/subscription-server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  try {
    const { id, logo_url } = await req.json()
    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
    }
    
    // Check subscription - customBranding feature required for logo updates
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Établissement non trouvé' 
      }, { status: 404 })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const safeLogoUrl = sanitizeString(logo_url, 500)
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url: safeLogoUrl })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Audit log: action, user, details
    await auditLog({
      action: 'update',
      user: slug,
      details: 'Logo updated via admin API.'
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
    
    // Check subscription - customBranding feature required for logo updates
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Établissement non trouvé' 
      }, { status: 404 })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url: null })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await auditLog({
      action: 'delete',
      user: slug,
      details: 'Logo deleted via admin API.'
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
