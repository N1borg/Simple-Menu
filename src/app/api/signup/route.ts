import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { createStripeCheckoutSession } from '@/lib/stripe-server'

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let establishmentSlug = 'unknown'

  try {
    const body = await req.json()
    const {
      establishmentName,
      establishmentSlug: requestSlug,
      email,
      phone,
      plan
    } = body
    
    establishmentSlug = requestSlug || 'unknown'

    // Validate required fields
    if (!establishmentName || !establishmentSlug || !email || !plan) {
      auditLog({
        action: 'signup_failed',
        severity: 'warning',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing required fields' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(establishmentSlug)) {
      auditLog({
        action: 'signup_failed',
        severity: 'warning',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid slug format' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Forbidden slugs
    const forbiddenSlugs = ['admin', 'api', 'www', 'app', 'demo', 'test', 'signup', 'login']
    if (forbiddenSlugs.includes(establishmentSlug)) {
      auditLog({
        action: 'signup_failed',
        severity: 'warning',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Forbidden slug' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Check if slug already exists (but don't create establishment yet)
    const { data: existingEstablishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('slug', establishmentSlug)
      .single()

    if (existingEstablishment) {
      auditLog({
        action: 'signup_failed',
        severity: 'warning',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Slug already taken' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 409 })
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
      auditLog({
        action: 'signup_failed',
        severity: 'error',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Stripe checkout session creation failed',
          stripeError: stripeResult.error
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'signup_payment_initiated',
      severity: 'info',
      user: establishmentSlug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
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
      severity: 'error',
      user: establishmentSlug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
