import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

export async function GET(req: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = req.cookies.get('admin-session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Verify JWT and get slug
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    const slug = payload.slug as string

    if (!slug) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const supabase = await getServerSupabase()

    // Get establishment basic info
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, primary_color, logo_url')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      primary_color: establishment.primary_color,
      logo_url: establishment.logo_url
    })

  } catch (error) {
    console.error('Error in establishment-info API:', error)
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 })
  }
}
