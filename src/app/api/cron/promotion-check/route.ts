import { NextRequest, NextResponse } from 'next/server'
import { processPromotionExpirations } from '@/lib/promotion-manager'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

/**
 * API Route pour traiter automatiquement les fins de promotion
 * À appeler via un cron job externe (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)

  try {
    // Vercel Cron Jobs are authenticated differently
    // Check if the request is coming from Vercel Cron
    const authHeader = req.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // For Vercel Cron, check the user-agent or use a different auth method
    const isVercelCron = req.headers.get('user-agent')?.includes('vercel-cron') || 
                        req.headers.get('x-vercel-cron') === '1'
    
    // Allow Vercel cron requests or requests with valid secret
    if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      auditLog({
        action: 'promotion_check_unauthorized',
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

    console.log('Starting promotion expiration check...')
    const processedCount = await processPromotionExpirations()
    console.log(`Processed ${processedCount} subscription(s)`)
    
    auditLog({
      action: 'promotion_check_success',
      severity: 'info',
      user: 'system',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { processedCount }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `${processedCount} abonnements traités`,
      processedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job error:', error)
    auditLog({
      action: 'promotion_check_error',
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

/**
 * GET pour vérifier que l'endpoint fonctionne
 */
export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint de gestion des promotions actif',
    timestamp: new Date().toISOString()
  })
}
