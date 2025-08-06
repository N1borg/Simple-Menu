import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function GET(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      auditLog({
        action: 'verify_payment_failed',
        severity: 'warning',
        user: 'unknown',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing session ID' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      auditLog({
        action: 'verify_payment_failed',
        severity: 'warning',
        user: 'unknown',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Session not found', sessionId }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    const { establishmentId, establishmentSlug } = session.metadata || {}

    if (!establishmentId || !establishmentSlug) {
      auditLog({
        action: 'verify_payment_failed',
        severity: 'warning',
        user: establishmentSlug || 'unknown',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing metadata', sessionId }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Check if the establishment exists and get its details
    const supabase = await getServerSupabase()
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, slug, plan')
      .eq('id', establishmentId)
      .single()

    if (error || !establishment) {
      auditLog({
        action: 'verify_payment_failed',
        severity: 'error',
        user: establishmentSlug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Establishment not found',
          establishmentId,
          sessionId,
          dbError: error?.code,
          dbMessage: error?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    auditLog({
      action: 'verify_payment_success',
      severity: 'info',
      user: establishmentSlug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        establishmentId,
        sessionId,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total
      }
    })

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
    auditLog({
      action: 'verify_payment_error',
      severity: 'error',
      user: 'unknown',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
