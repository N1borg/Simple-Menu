import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'

export async function GET(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const { searchParams } = new URL(req.url)
    const querySlug = searchParams.get('slug')

    if (querySlug) {
      slug = querySlug
      auditLog({
        action: 'establishment_info_public_access',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        statusCode: 200,
        details: { slug: querySlug },
        severity: 'info'
      })
    } else {
      // fallback to admin auth
      const adminAuth = await requireSecureAdminAuth(req)
      if ('status' in adminAuth) {
        auditLog({
          action: 'establishment_info_failed',
          ip: requestMetadata.ip,
          userAgent: requestMetadata.userAgent,
          method: requestMetadata.method,
          url: requestMetadata.url,
          statusCode: 401,
          details: { reason: 'auth_failed' },
          severity: 'warning'
        })
        return adminAuth
      }
      slug = adminAuth.slug
      // Block demo requests for admin dashboard only
      if (slug === 'demo') {
        auditLog({
          action: 'establishment_info_blocked',
          ip: requestMetadata.ip,
          userAgent: requestMetadata.userAgent,
          method: requestMetadata.method,
          url: requestMetadata.url,
          user: slug,
          statusCode: 403,
          details: { reason: 'demo_mode' },
          severity: 'info'
        })
        return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
      }
    }

    if (!slug) {
      auditLog({
        action: 'establishment_info_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        statusCode: 400,
        details: { reason: 'missing_slug' },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.BAD_REQUEST }, { status: 400 })
    }

    const supabase = await getServerSupabase()

    // Get establishment basic info
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, name, primary_color, secondary_color, logo_url, address, phone, email, facebook_url, instagram_url, google_maps_url, opening_hours, basket_enabled')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      auditLog({
        action: 'establishment_info_failed',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        statusCode: 404,
        details: { 
          slug,
          reason: 'establishment_not_found',
          dbError: error?.code
        },
        severity: 'warning'
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    auditLog({
      action: 'establishment_info_success',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      statusCode: 200,
      details: { 
        slug,
        establishmentId: establishment.id,
        accessType: slug === querySlug ? 'public' : 'admin'
      },
      severity: 'info'
    })

    return NextResponse.json({
      id: establishment.id,
      name: establishment.name,
      secondary_color: establishment.secondary_color,
      primary_color: establishment.primary_color,
      secondary_color: establishment.secondary_color,
      logo_url: establishment.logo_url,
      address: establishment.address,
      phone: establishment.phone,
      email: establishment.email,
      facebook_url: establishment.facebook_url,
      instagram_url: establishment.instagram_url,
      google_maps_url: establishment.google_maps_url,
      opening_hours: establishment.opening_hours,
      basket_enabled: establishment.basket_enabled
    })

  } catch (error) {
    auditLog({
      action: 'establishment_info_error',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      user: slug,
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
