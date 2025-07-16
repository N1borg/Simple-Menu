import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ 
      error: 'Session ID manquant' 
    }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'Session non trouvée' 
      }, { status: 404 })
    }

    const { establishmentId, establishmentSlug } = session.metadata || {}

    if (!establishmentId || !establishmentSlug) {
      return NextResponse.json({ 
        error: 'Métadonnées manquantes' 
      }, { status: 400 })
    }

    // Check if the establishment exists and get its details
    const supabase = await getServerSupabase()
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, slug, plan')
      .eq('id', establishmentId)
      .single()

    if (error || !establishment) {
      return NextResponse.json({ 
        error: 'Établissement non trouvé' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        plan: establishment.plan,
        planStatus: 'active', // Default for now
        isActive: true // Default for now
      },
      session: {
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification du paiement' 
    }, { status: 500 })
  }
}
