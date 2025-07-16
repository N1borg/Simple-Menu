import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, password } = body

    if (!slug) {
      return NextResponse.json({ 
        error: 'Slug de l\'établissement requis' 
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ 
        error: 'Mot de passe requis' 
      }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Get establishment by slug
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('*')
      .eq('slug', slug)
      .single()

    if (establishmentError || !establishment) {
      return NextResponse.json({ 
        error: 'Établissement non trouvé' 
      }, { status: 404 })
    }

    // Check password
    let isValidPassword = false
    if (password && establishment.admin_hash) {
      isValidPassword = await bcrypt.compare(password, establishment.admin_hash)
    }

    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Mot de passe incorrect' 
      }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        establishmentId: establishment.id,
        slug: establishment.slug,
        email: establishment.email
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        email: establishment.email,
        plan: establishment.plan,
        plan_status: establishment.plan_status,
        is_active: establishment.is_active,
        trial_ends_at: establishment.trial_ends_at
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
