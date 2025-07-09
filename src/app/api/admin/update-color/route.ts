import { getServerSupabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'
import { auditLog } from '@/lib/security'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase()
  
  // Verify admin authentication
  const authResult = await requireAdminAuth(req)
  if ('status' in authResult) {
    return authResult
  }

  const { slug } = authResult
  
  try {
    const body = await req.json()
    const { color } = body
    
    // Input validation
    if (!color || typeof color !== 'string') {
      await auditLog({
        action: 'update_color_failed',
        user: slug,
        details: { reason: 'Invalid color input', input: typeof color }
      })
      return NextResponse.json(
        { error: 'Couleur invalide' },
        { status: 400 }
      )
    }

    // Sanitize input - trim whitespace and convert to lowercase for validation
    const sanitizedColor = color.trim().toLowerCase()
    
    // Validate hex color format (strict validation)
    const hexColorRegex = /^#([a-f0-9]{6}|[a-f0-9]{3})$/
    if (!hexColorRegex.test(sanitizedColor)) {
      await auditLog({
        action: 'update_color_failed',
        user: slug,
        details: { reason: 'Invalid hex color format', input: sanitizedColor }
      })
      return NextResponse.json(
        { error: 'Format de couleur invalide. Utilisez le format hexadécimal (#ffffff ou #fff)' },
        { status: 400 }
      )
    }

    // Additional security: ensure color is reasonable (not too long)
    if (sanitizedColor.length > 7) {
      await auditLog({
        action: 'update_color_failed',
        user: slug,
        details: { reason: 'Color input too long', input: sanitizedColor }
      })
      return NextResponse.json(
        { error: 'Format de couleur invalide' },
        { status: 400 }
      )
    }

    // Block demo modifications
    if (slug === 'demo') {
      await auditLog({
        action: 'update_color_blocked',
        user: slug,
        details: { reason: 'Demo modification blocked' }
      })
      return NextResponse.json(
        { error: 'Modification désactivée (mode démo)' },
        { status: 403 }
      )
    }

    // Verify establishment exists and belongs to authenticated user
    const { data: establishment, error: fetchError } = await supabase
      .from('establishments')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (fetchError || !establishment) {
      await auditLog({
        action: 'update_color_failed',
        user: slug,
        details: { reason: 'Establishment not found' }
      })
      return NextResponse.json(
        { error: 'Établissement non trouvé' },
        { status: 404 }
      )
    }

    // Update the color
    const { error } = await supabase
      .from('establishments')
      .update({ 
        primary_color: sanitizedColor
      })
      .eq('slug', slug)

    if (error) {
      console.error('Error updating color:', error)
      await auditLog({
        action: 'update_color_failed',
        user: slug,
        details: { reason: 'Database error', error: error.message }
      })
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la couleur' },
        { status: 500 }
      )
    }

    // Success audit log
    await auditLog({
      action: 'update_color_success',
      user: slug,
      details: { 
        establishmentName: establishment.name,
        newColor: sanitizedColor 
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Couleur mise à jour avec succès',
      color: sanitizedColor 
    })

  } catch (error) {
    console.error('Error in update-color API:', error)
    await auditLog({
      action: 'update_color_error',
      user: slug || 'unknown',
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    })
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
