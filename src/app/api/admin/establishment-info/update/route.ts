import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'
import { z } from 'zod'

const EstablishmentInfoSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  opening_hours: z.array(z.object({
    day: z.string(),
    hours: z.string()
  })).optional(),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal(''))
})

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireSecureAdminAuth(req)
    if ('status' in adminAuth) {
      return adminAuth
    }

    const { slug } = adminAuth
    
    // Block demo requests
    if (slug === 'demo') {
      return NextResponse.json({ error: 'Modification interdite en mode démo' }, { status: 403 })
    }
    
    const body = await req.json()
    
    const validatedData = EstablishmentInfoSchema.parse(body)
    
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
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des informations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
