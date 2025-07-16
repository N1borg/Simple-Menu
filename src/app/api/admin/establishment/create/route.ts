import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString } from '@/lib/validate'
import { sanitizeEmail } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { generateInitialPassword, generateSlug, sendSetupEmail } from '@/lib/email-gmail'
import { z } from 'zod'

// Input validation schema
const CreateEstablishmentSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'établissement est requis').max(100),
  contactEmail: z.string().email('Email invalide'),
  adminKey: z.string().min(1, 'Clé d\'administration requise'), // Security key for creating establishments
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  
  try {
    // Parse and validate input
    const body = await req.json()
    const { name, contactEmail, adminKey } = CreateEstablishmentSchema.parse(body)

    // Verify admin key (environment variable for security)
    if (adminKey !== process.env.ADMIN_CREATE_KEY) {
      auditLog({ 
        action: 'establishment_create_unauthorized', 
        ip, 
        details: { name, contactEmail } 
      })
      return NextResponse.json({ 
        error: 'Clé d\'administration invalide' 
      }, { status: 401 })
    }

    // Sanitize inputs
    const safeName = sanitizeString(name, 100)
    const safeEmail = sanitizeEmail(contactEmail)

    if (!safeName || !safeEmail) {
      return NextResponse.json({ 
        error: 'Données invalides' 
      }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = generateSlug(safeName)
    let slug = baseSlug
    let counter = 1

    const supabase = await getServerSupabase()

    // Check if slug already exists and make it unique
    while (true) {
      const { data: existing } = await supabase
        .from('establishments')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) break
      
      slug = `${baseSlug}-${counter}`
      counter++
      
      // Prevent infinite loop
      if (counter > 100) {
        return NextResponse.json({ 
          error: 'Impossible de générer un identifiant unique' 
        }, { status: 500 })
      }
    }

    // Generate temporary password
    const initialPassword = generateInitialPassword()
    const adminHash = await bcrypt.hash(initialPassword, 12)

    // Create establishment in database
    const { data: establishment, error: createError } = await supabase
      .from('establishments')
      .insert([{
        name: safeName,
        slug: slug,
        email: safeEmail,
        admin_hash: adminHash,
        plan: 'trial', // Default to trial plan
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (createError) {
      auditLog({ 
        action: 'establishment_create_failed', 
        ip, 
        details: { name: safeName, slug, error: createError } 
      })
      return NextResponse.json({ 
        error: 'Erreur lors de la création de l\'établissement' 
      }, { status: 500 })
    }

    // Prepare credentials for email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://simple-menu.com'
    const credentials = {
      establishmentName: safeName,
      slug: slug,
      initialPassword: initialPassword,
      setupUrl: `${baseUrl}/e/${slug}/admin/setup`,
      adminUrl: `${baseUrl}/e/${slug}/admin`,
      contactEmail: safeEmail
    }

    // Send setup email (non-blocking)
    sendSetupEmail(credentials).catch(error => {
      // Log email failure but don't fail the establishment creation
      auditLog({ 
        action: 'establishment_email_failed', 
        ip, 
        details: { slug, email: safeEmail, error: error.message } 
      })
    })

    // Log successful creation
    auditLog({ 
      action: 'establishment_created', 
      ip, 
      details: { 
        name: safeName, 
        slug, 
        email: safeEmail,
        establishmentId: establishment.id 
      } 
    })

    // Return success response (without sensitive data)
    return NextResponse.json({
      success: true,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        slug: establishment.slug,
        email: establishment.email,
        setupUrl: credentials.setupUrl,
        adminUrl: credentials.adminUrl
      },
      message: 'Établissement créé avec succès. Email de configuration envoyé.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: error.errors 
      }, { status: 400 })
    }

    auditLog({ 
      action: 'establishment_create_error', 
      ip, 
      details: { error: error instanceof Error ? error.message : 'Unknown error' } 
    })
    
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

// Optional: GET endpoint to list establishments (admin only)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const adminKey = url.searchParams.get('adminKey')
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  
  // Verify admin key
  if (adminKey !== process.env.ADMIN_CREATE_KEY) {
    auditLog({ 
      action: 'establishment_list_unauthorized', 
      ip, 
      details: {} 
    })
    return NextResponse.json({ 
      error: 'Non autorisé' 
    }, { status: 401 })
  }

  try {
    const supabase = await getServerSupabase()
    
    const { data: establishments, error } = await supabase
      .from('establishments')
      .select('id, name, slug, email, created_at, plan, primary_color')
      .order('created_at', { ascending: false })
      .limit(50) // Limit for performance

    if (error) {
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des établissements' 
      }, { status: 500 })
    }

    auditLog({ 
      action: 'establishment_list_accessed', 
      ip, 
      details: { count: establishments.length } 
    })

    return NextResponse.json({
      success: true,
      establishments: establishments.map(est => ({
        ...est,
        setupUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://simple-menu.com'}/e/${est.slug}/admin/setup`,
        adminUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://simple-menu.com'}/e/${est.slug}/admin`,
        isSetupComplete: !!est.primary_color
      }))
    })

  } catch (error) {
    auditLog({ 
      action: 'establishment_list_error', 
      ip, 
      details: { error: error instanceof Error ? error.message : 'Unknown error' } 
    })
    
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}
