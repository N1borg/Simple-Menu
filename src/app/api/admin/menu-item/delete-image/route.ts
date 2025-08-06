import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function POST(req: NextRequest) {
  const metadata = getRequestMetadata(req)
  
  try {
    const body = await req.json()
    const { item_id } = body
    
    if (!item_id) {
      auditLog({
        action: 'delete_item_image_failed',
        ...metadata,
        statusCode: 400,
        details: { reason: 'missing_item_id' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: null })
      .eq('id', item_id)
      
    if (error) {
      auditLog({
        action: 'delete_item_image_failed',
        ...metadata,
        statusCode: 500,
        details: { 
          item_id,
          dbError: error.code,
          dbMessage: error.message
        },
        severity: 'error'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    auditLog({
      action: 'delete_item_image_success',
      ...metadata,
      statusCode: 200,
      details: { item_id },
      severity: 'info'
    })
    
    return NextResponse.json({ success: true })

  } catch (error) {
    auditLog({
      action: 'delete_item_image_error',
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
