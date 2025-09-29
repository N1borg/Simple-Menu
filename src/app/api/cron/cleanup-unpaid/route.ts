import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

/**
 * Cleanup job to remove unpaid establishments after 24 hours
 * This prevents the database from filling up with abandoned signups
 */
export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)

  try {
    // Vercel Cron Jobs are authenticated differently
    const authHeader = req.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // For Vercel Cron, check the user-agent or use a different auth method
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron') || 
                        req.headers.get('x-vercel-cron') === '1'
    
    // Allow Vercel cron requests or requests with valid secret
    if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      auditLog({
        action: 'cleanup_unpaid_unauthorized',
        severity: 'warning',
        user: 'system',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Unauthorized cron access' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.UNAUTHORIZED }, { status: 401 })
    }

    const supabase = await getServerSupabase()
    
    // Find establishments that are pending payment for more than 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    console.log(`Checking for unpaid establishments created before: ${twentyFourHoursAgo.toISOString()}`)
    
    const { data: unpaidEstablishments, error: fetchError } = await supabase
      .from('establishments')
      .select('id, slug, created_at')
      .eq('plan_status', 'pending_payment')
      .eq('is_active', false)
      .lt('created_at', twentyFourHoursAgo.toISOString())
    
    if (fetchError) {
      console.error('Error fetching unpaid establishments:', fetchError)
      auditLog({
        action: 'cleanup_unpaid_failed',
        severity: 'error',
        user: 'system',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Database fetch error',
          dbError: fetchError.code,
          dbMessage: fetchError.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }
    
    if (!unpaidEstablishments || unpaidEstablishments.length === 0) {
      console.log('No unpaid establishments to clean up')
      auditLog({
        action: 'cleanup_unpaid_none',
        severity: 'info',
        user: 'system',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { message: 'No establishments to clean up' }
      })
      return NextResponse.json({
        success: true,
        message: 'Aucun établissement à nettoyer',
        cleanedCount: 0,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log(`Found ${unpaidEstablishments.length} unpaid establishments to clean up`)
    
    // Delete the unpaid establishments
    const { error: deleteError } = await supabase
      .from('establishments')
      .delete()
      .in('id', unpaidEstablishments.map(e => e.id))
    
    if (deleteError) {
      console.error('Error deleting unpaid establishments:', deleteError)
      auditLog({
        action: 'cleanup_unpaid_failed',
        severity: 'error',
        user: 'system',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Database delete error',
          count: unpaidEstablishments.length,
          dbError: deleteError.code,
          dbMessage: deleteError.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }
    
    console.log(`Successfully cleaned up ${unpaidEstablishments.length} unpaid establishments`)
    
    auditLog({
      action: 'cleanup_unpaid_success',
      severity: 'info',
      user: 'system',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        cleanedCount: unpaidEstablishments.length,
        cleanedSlugs: unpaidEstablishments.map(e => e.slug)
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${unpaidEstablishments.length} établissements non payés supprimés`,
      cleanedCount: unpaidEstablishments.length,
      cleanedSlugs: unpaidEstablishments.map(e => e.slug),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup cron job error:', error)
    auditLog({
      action: 'cleanup_unpaid_error',
      severity: 'error',
      user: 'system',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cleanup job endpoint active',
    description: 'Removes establishments that have been pending payment for more than 24 hours',
    timestamp: new Date().toISOString()
  })
}
