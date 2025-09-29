import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security'
import { z } from 'zod'

const EstablishmentInfoSchema = z.object({
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  opening_hours: z.array(z.object({
    day: z.string(),
    hours: z.string()
  })).optional(),
  facebook_url: z.string().max(100).optional().or(z.literal('')),
  instagram_url: z.string().max(100).optional().or(z.literal(''))
})

function padTimeString(hoursString: string): string {
  return hoursString.replace(/(\d{1,2}):(\d{1,2})/g, (_, h, m) => {
    const hh = h.padStart(2, '0');
    const mm = m.padStart(2, '0');
    return `${hh}:${mm}`;
  });
}

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'
  
  try {
    const adminAuth = await requireSecureAdminAuth(req)
    if ('status' in adminAuth) {
      auditLog({
        action: 'establishment_info_update_failed',
        severity: 'warning',
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Authentication failed' }
      })
      return adminAuth
    }

    slug = adminAuth.slug
    
    // Block demo requests
    if (slug === 'demo') {
      auditLog({
        action: 'establishment_info_update_blocked',
        severity: 'info',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }
    
    const body = await req.json()
    
    auditLog({
      action: 'establishment_info_update_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        hasAddress: !!body.address,
        hasPhone: !!body.phone,
        hasEmail: !!body.email,
        hasOpeningHours: !!body.opening_hours,
        hasFacebook: !!body.facebook_url,
        hasInstagram: !!body.instagram_url
      }
    })
    
    const validatedData = EstablishmentInfoSchema.parse(body)
    // Pad all hours in opening_hours
    if (validatedData.opening_hours) {
      validatedData.opening_hours = validatedData.opening_hours.map((entry) => ({
        ...entry,
        hours: padTimeString(entry.hours)
      }))
    }
    
    const supabase = await getServerSupabase()
    
    // Update establishment with the new information
    const { error } = await supabase
      .from('establishments')
      .update({
        address: validatedData.address,
        phone: validatedData.phone,
        email: validatedData.email,
        opening_hours: validatedData.opening_hours,
        facebook_url: validatedData.facebook_url,
        instagram_url: validatedData.instagram_url
      })
      .eq('slug', slug)

    if (error) {
      auditLog({
        action: 'establishment_info_update_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          dbError: error.code,
          dbMessage: error.message
        }
      })
      return NextResponse.json(
        { error: STANDARD_ERRORS.SERVER_ERROR },
        { status: 500 }
      )
    }

    auditLog({
      action: 'establishment_info_update_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        fieldsUpdated: Object.keys(validatedData).filter(key => 
          validatedData[key as keyof typeof validatedData] !== undefined
        )
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof z.ZodError) {
      auditLog({
        action: 'establishment_info_update_validation_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { validationErrors: error.errors }
      })
      return NextResponse.json(
        { error: STANDARD_ERRORS.INVALID_INPUT },
        { status: 400 }
      )
    }
    
    auditLog({
      action: 'establishment_info_update_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json(
      { error: STANDARD_ERRORS.SERVER_ERROR },
      { status: 500 }
    )
  }
}
