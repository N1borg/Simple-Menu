import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({ 
        error: 'Slug manquant' 
      }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Check if establishment exists and is active
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, slug, plan, plan_status, is_active, created_at')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      return NextResponse.json({ 
        verified: false,
        error: 'Établissement non trouvé' 
      }, { status: 404 })
    }

    // Check if payment is verified (plan_status should be 'active', 'trialing', or 'trial')
    const isPaymentVerified = establishment.plan_status === 'active' || 
                              establishment.plan_status === 'trialing' ||
                              establishment.plan_status === 'trial'

    return NextResponse.json({
      verified: true,
      paymentVerified: isPaymentVerified,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        plan: establishment.plan,
        planStatus: establishment.plan_status,
        isActive: establishment.is_active,
        createdAt: establishment.created_at
      }
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ 
      verified: false,
      error: 'Erreur lors de la vérification' 
    }, { status: 500 })
  }
}
