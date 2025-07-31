import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const querySlug = searchParams.get('slug')

    let slug: string | null = null

    if (querySlug) {
      slug = querySlug
    } else {
      // fallback to admin auth
      const adminAuth = await requireSecureAdminAuth(req)
      if ('status' in adminAuth) {
        return adminAuth
      }
      slug = adminAuth.slug
      // Block demo requests for admin dashboard only
      if (slug === 'demo') {
        return NextResponse.json({ error: 'Accès non autorisé en mode démo' }, { status: 403 })
      }
    }

    const supabase = await getServerSupabase()

    // Get establishment basic info
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, primary_color, secondary_color, logo_url, address, phone, email, facebook_url, instagram_url, google_maps_url, opening_hours, basket_enabled')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      secondary_color: establishment.secondary_color,
      primary_color: establishment.primary_color,
      logo_url: establishment.logo_url,
      address: establishment.address,
      phone: establishment.phone,
      email: establishment.email,
      facebook_url: establishment.facebook_url,
      instagram_url: establishment.instagram_url,
      google_maps_url: establishment.google_maps_url,
      opening_hours: establishment.opening_hours,
      basket_enabled: establishment.basket_enabled
    })

  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 })
  }
}
