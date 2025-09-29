import { getServerSupabase } from '@/lib/supabase'
import { requireSecureAdminAuth } from '@/lib/auth'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const metadata = getRequestMetadata(req)
  
  try {
    const supabase = await getServerSupabase()
    
    // Verify admin authentication
    const authResult = await requireSecureAdminAuth(req)
    if ('status' in authResult) {
      auditLog({
        action: 'basket_toggle_failed',
        ...metadata,
        statusCode: 401,
        details: { reason: 'auth_failed' },
        severity: 'warning'
      })
      return authResult
    }

    const { slug } = authResult

    const body = await req.json()
    const { basketEnabled } = body

    // Input validation
    if (typeof basketEnabled !== 'boolean') {
      auditLog({
        action: 'basket_toggle_failed',
        ...metadata,
        user: slug,
        statusCode: 400,
        details: { 
          reason: 'invalid_input', 
          inputType: typeof basketEnabled,
          expectedType: 'boolean'
        },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Find the establishment by slug
    const { data: establishment, error: fetchError } = await supabase
      .from('establishments')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (fetchError || !establishment) {
      auditLog({
        action: 'basket_toggle_failed',
        ...metadata,
        user: slug,
        statusCode: 404,
        details: { 
          reason: 'establishment_not_found', 
          dbError: fetchError?.code,
          dbMessage: fetchError?.message
        },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Update the basket_enabled setting
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ 
        basket_enabled: basketEnabled
      })
      .eq('id', establishment.id)

    if (updateError) {
      // Check if error is due to missing column
      if (updateError.message.includes('basket_enabled') && updateError.message.includes('column')) {
        auditLog({
          action: 'basket_toggle_failed',
          ...metadata,
          user: slug,
          statusCode: 500,
          details: { 
            reason: 'missing_column',
            dbError: updateError.code,
            dbMessage: updateError.message,
            basketEnabled,
            migration_needed: true
          },
          severity: 'critical'
        })
        return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
      }

      auditLog({
        action: 'basket_toggle_failed',
        ...metadata,
        user: slug,
        statusCode: 500,
        details: { 
          reason: 'db_update_failed',
          dbError: updateError.code,
          dbMessage: updateError.message,
          basketEnabled
        },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    // Log successful update
    auditLog({
      action: 'basket_toggle_success',
      ...metadata,
      user: slug,
      statusCode: 200,
      details: { basketEnabled },
      severity: 'info'
    })

    return NextResponse.json({ 
      success: true,
      basketEnabled
    })

  } catch (error) {
    auditLog({
      action: 'basket_toggle_error',
      ...metadata,
      statusCode: 500,
      details: { 
        error: error instanceof Error ? error.message : 'unknown_error',
        stack: error instanceof Error ? error.stack : undefined
      },
      severity: 'error'
    })
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
