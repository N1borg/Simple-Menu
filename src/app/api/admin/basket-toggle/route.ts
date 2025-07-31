import { getServerSupabase } from '@/lib/supabase'
import { requireSecureAdminAuth } from '@/lib/auth'
import { auditLog } from '@/lib/security'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase()
  
  // Verify admin authentication
  const authResult = await requireSecureAdminAuth(req)
  if ('status' in authResult) {
    return authResult
  }

  const { slug } = authResult
  
  try {
    const body = await req.json()
    const { basketEnabled } = body
    
    // Input validation
    if (typeof basketEnabled !== 'boolean') {
      await auditLog({
        action: 'update_basket_enabled_failed',
        user: slug,
        details: { reason: 'Invalid basketEnabled input', input: typeof basketEnabled }
      })
      return NextResponse.json(
        { error: 'Valeur basket invalide' },
        { status: 400 }
      )
    }

    // Find the establishment by slug
    const { data: establishment, error: fetchError } = await supabase
      .from('establishments')
      .select('id, slug')
      .eq('slug', slug)
      .single()

    if (fetchError || !establishment) {
      await auditLog({
        action: 'update_basket_enabled_failed',
        user: slug,
        details: { reason: 'Establishment not found', error: fetchError?.message }
      })
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    // Update the basket_enabled setting
    // Note: If basket_enabled column doesn't exist, this will fail gracefully
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ 
        basket_enabled: basketEnabled
      })
      .eq('id', establishment.id)

    if (updateError) {
      // Check if error is due to missing column
      if (updateError.message.includes('basket_enabled') && updateError.message.includes('column')) {
        await auditLog({
          action: 'update_basket_enabled_failed',
          user: slug,
          details: { 
            reason: 'Column basket_enabled does not exist. Please run the database migration.',
            error: updateError.message,
            basketEnabled,
            migration_needed: true
          }
        })
        return NextResponse.json(
          { 
            error: 'Fonctionnalité panier non configurée. Veuillez contacter l\'administrateur.',
            migration_needed: true
          },
          { status: 500 }
        )
      }

      await auditLog({
        action: 'update_basket_enabled_failed',
        user: slug,
        details: { 
          reason: 'Database update failed',
          error: updateError.message,
          basketEnabled
        }
      })
      console.error('Error updating basket setting:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du paramètre panier' },
        { status: 500 }
      )
    }

    // Log successful update
    await auditLog({
      action: 'update_basket_enabled_success',
      user: slug,
      details: { basketEnabled }
    })

    return NextResponse.json({ 
      success: true,
      basketEnabled
    })

  } catch (error) {
    await auditLog({
      action: 'update_basket_enabled_failed',
      user: slug,
      details: { 
        reason: 'Unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
    console.error('Error in basket toggle API:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
