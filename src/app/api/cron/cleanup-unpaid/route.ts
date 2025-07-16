import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * Cleanup job to remove unpaid establishments after 24 hours
 * This prevents the database from filling up with abandoned signups
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const supabase = await getServerSupabase()
    
    // Find establishments that are pending payment for more than 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const { data: unpaidEstablishments, error: fetchError } = await supabase
      .from('establishments')
      .select('id, slug, created_at')
      .eq('plan_status', 'pending_payment')
      .eq('is_active', false)
      .lt('created_at', twentyFourHoursAgo.toISOString())
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }
    
    if (!unpaidEstablishments || unpaidEstablishments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun établissement à nettoyer',
        cleanedCount: 0
      })
    }
    
    // Delete the unpaid establishments
    const { error: deleteError } = await supabase
      .from('establishments')
      .delete()
      .in('id', unpaidEstablishments.map(e => e.id))
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `${unpaidEstablishments.length} établissements non payés supprimés`,
      cleanedCount: unpaidEstablishments.length,
      cleanedSlugs: unpaidEstablishments.map(e => e.slug)
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cleanup job endpoint active',
    description: 'Removes establishments that have been pending payment for more than 24 hours',
    timestamp: new Date().toISOString()
  })
}
