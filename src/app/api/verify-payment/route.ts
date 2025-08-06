import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function GET(req: NextRequest) {
  const metadata = getRequestMetadata(req)
  
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      auditLog({
        action: 'verify_payment_failed',
        ...metadata,
        statusCode: 400,
        details: { reason: 'missing_slug' },
        severity: 'warning'
      })
      return NextResponse.json({ 
        verified: false,
        error: STANDARD_ERRORS.BAD_REQUEST
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
      auditLog({
        action: 'verify_payment_failed',
        ...metadata,
        statusCode: 404,
        details: { 
          slug,
          reason: 'establishment_not_found',
          dbError: error?.code
        },
        severity: 'warning'
      })
      return NextResponse.json({ 
        verified: false,
        error: STANDARD_ERRORS.NOT_FOUND
      }, { status: 404 })
    }

    // Check if payment is verified (plan_status should be 'active', 'trialing', or 'trial')
    const isPaymentVerified = establishment.plan_status === 'active' || 
                              establishment.plan_status === 'trialing' ||
                              establishment.plan_status === 'trial'

    auditLog({
      action: 'verify_payment_success',
      ...metadata,
      statusCode: 200,
      details: { 
        slug,
        paymentVerified: isPaymentVerified,
        plan: establishment.plan,
        planStatus: establishment.plan_status
      },
      severity: 'info'
    })

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
    auditLog({
      action: 'verify_payment_error',
      ...metadata,
      statusCode: 500,
      details: { 
        error: error instanceof Error ? error.message : 'unknown_error',
        stack: error instanceof Error ? error.stack : undefined
      },
      severity: 'error'
    })
    return NextResponse.json({ 
      verified: false,
      error: STANDARD_ERRORS.SERVER_ERROR
    }, { status: 500 })
  }
}
