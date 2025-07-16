import { NextRequest, NextResponse } from 'next/server'
import { processPromotionExpirations } from '@/lib/promotion-manager'

/**
 * API Route pour traiter automatiquement les fins de promotion
 * À appeler via un cron job externe (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET || 'SimpleMenu2025CronSecret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const processedCount = await processPromotionExpirations()
    
    return NextResponse.json({ 
      success: true, 
      message: `${processedCount} abonnements traités`,
      processedCount 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
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
