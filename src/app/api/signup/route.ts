import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { createStripeCheckoutSession } from '@/lib/stripe-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      establishmentName,
      establishmentSlug,
      email,
      phone,
      plan
    } = body

    // Validate required fields
    if (!establishmentName || !establishmentSlug || !email || !plan) {
      return NextResponse.json({ 
        error: 'Champs obligatoires manquants' 
      }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(establishmentSlug)) {
      return NextResponse.json({ 
        error: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets' 
      }, { status: 400 })
    }

    // Forbidden slugs
    const forbiddenSlugs = ['admin', 'api', 'www', 'app', 'demo', 'test', 'signup', 'login']
    if (forbiddenSlugs.includes(establishmentSlug)) {
      return NextResponse.json({ 
        error: 'Ce nom d\'URL est réservé, veuillez en choisir un autre' 
      }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Check if slug already exists (but don't create establishment yet)
    const { data: existingEstablishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('slug', establishmentSlug)
      .single()

    if (existingEstablishment) {
      return NextResponse.json({ 
        error: 'Cette URL est déjà prise, veuillez en choisir une autre' 
      }, { status: 409 })
    }

    // Generate secure random initial password (will be hashed after payment)
    function generateSecurePassword(): string {
      const length = 16
      const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      const lowercase = 'abcdefghijkmnpqrstuvwxyz'
      const numbers = '23456789'
      const symbols = '!@#$%&*+-=?'
      const allChars = uppercase + lowercase + numbers + symbols
      
      let password = ''
      
      // Ensure at least one character from each type
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += symbols[Math.floor(Math.random() * symbols.length)]
      
      // Fill the rest with random characters
      for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
      }
      
      // Shuffle the password to avoid predictable patterns
      return password.split('').sort(() => Math.random() - 0.5).join('')
    }
    
    const initialPassword = generateSecurePassword()

    // Create Stripe checkout session with all data in metadata
    // The establishment will be created ONLY after successful payment
    const stripeResult = await createStripeCheckoutSession({
      plan,
      customerEmail: email,
      customerName: establishmentName,
      customerPhone: phone || undefined,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?slug=${establishmentSlug}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/?payment=cancel`,
      // Store all establishment data in Stripe metadata for creation after payment
      metadata: {
        establishmentName,
        establishmentSlug,
        email,
        phone: phone || '',
        plan,
        initialPassword
      }
    })

    if (!stripeResult.success || !stripeResult.checkoutUrl) {
      return NextResponse.json({ 
        error: stripeResult.error || 'Erreur lors de la création de la session de paiement' 
      }, { status: 500 })
    }

    auditLog({ 
      action: 'signup_payment_initiated', 
      user: establishmentSlug, 
      details: { 
        plan,
        email,
        checkoutSessionId: stripeResult.sessionId 
      } 
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: stripeResult.checkoutUrl,
      sessionId: stripeResult.sessionId,
      message: 'Session de paiement créée. L\'établissement sera créé après confirmation du paiement.'
    })

  } catch (error) {
    auditLog({ 
      action: 'signup_error', 
      user: 'unknown', 
      details: { error: error instanceof Error ? error.message : 'Unknown error' } 
    })

    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
