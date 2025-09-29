import { getServerSupabase } from '@/lib/supabase'
import { requireSecureAdminAuth } from '@/lib/auth'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionServerService } from '@/lib/subscription-server'

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const supabase = await getServerSupabase()
    
    // Verify admin authentication
    const authResult = await requireSecureAdminAuth(req)
    if ('status' in authResult) {
      return authResult
    }

    slug = authResult.slug
    
    const body = await req.json()
    const { color } = body
    
    // Check subscription - customBranding feature required for color updates
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'update_color_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Establishment not found' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Input validation
    if (!color || typeof color !== 'string') {
      auditLog({
        action: 'update_color_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid color input', inputType: typeof color }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Sanitize input - trim whitespace and convert to lowercase for validation
    const sanitizedColor = color.trim().toLowerCase()
    
    // Validate hex color format (strict validation)
    const hexColorRegex = /^#([a-f0-9]{6}|[a-f0-9]{3})$/
    if (!hexColorRegex.test(sanitizedColor)) {
      auditLog({
        action: 'update_color_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Invalid hex color format' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Additional security: ensure color is reasonable (not too long)
    if (sanitizedColor.length > 7) {
      auditLog({
        action: 'update_color_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Color input too long' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    // Block demo modifications
    if (slug === 'demo') {
      auditLog({
        action: 'update_color_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    // Verify establishment exists and belongs to authenticated user
    const { data: establishment, error: fetchError } = await supabase
      .from('establishments')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (fetchError || !establishment) {
      auditLog({
        action: 'update_color_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Establishment not found',
          dbError: fetchError?.code,
          dbMessage: fetchError?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Update the color
    const { error } = await supabase
      .from('establishments')
      .update({ 
        primary_color: sanitizedColor
      })
      .eq('slug', slug)

    if (error) {
      auditLog({
        action: 'update_color_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Database error',
          dbError: error.code,
          dbMessage: error.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
    }

    // Success audit log
    auditLog({
      action: 'update_color_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
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
    auditLog({
      action: 'update_color_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
