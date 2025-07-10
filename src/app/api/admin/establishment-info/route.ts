import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const adminAuth = await requireAdminAuth(req)
    if ('status' in adminAuth) {
      return adminAuth
    }

    const { slug } = adminAuth

    // Block demo requests
    if (slug === 'demo') {
      return NextResponse.json({ error: 'Accès non autorisé en mode démo' }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    // Get establishment basic info
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, primary_color, logo_url, address, phone, email, facebook_url, instagram_url, google_maps_url, opening_hours')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      primary_color: establishment.primary_color,
      logo_url: establishment.logo_url,
      address: establishment.address,
      phone: establishment.phone,
      email: establishment.email,
      facebook_url: establishment.facebook_url,
      instagram_url: establishment.instagram_url,
      google_maps_url: establishment.google_maps_url,
      opening_hours: establishment.opening_hours
    })

  } catch (error) {
    console.error('Error in establishment-info API:', error)
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 })
  }
}
