import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { auditLog } from '@/lib/security'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    const slug = (auth as { slug: string }).slug

    const { newPassword } = await req.json()
    
    if (!newPassword) {
      return NextResponse.json({ error: 'Nouveau mot de passe requis.' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 })
    }

    // Block modifications in demo mode
    if (slug === 'demo') {
      auditLog({ 
        action: 'set_password_attempt_demo_blocked', 
        user: slug, 
        details: { reason: 'Demo mode' } 
      })
      return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
    }

    const supabase = await getServerSupabase()

    // Get establishment by slug to ensure user can only update their own establishment
    const { data: establishment, error } = await supabase
      .from('establishments')
      .select('id, admin_hash')
      .eq('slug', slug)
      .single()

    if (error || !establishment) {
      auditLog({ 
        action: 'set_password_failed', 
        user: slug, 
        details: { reason: 'Establishment not found', error } 
      })
      return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 })
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10)

    // Update the password
    const { error: updateError } = await supabase
      .from('establishments')
      .update({ admin_hash: newHash })
      .eq('id', establishment.id)

    if (updateError) {
      auditLog({ 
        action: 'set_password_failed', 
        user: slug, 
        details: { reason: 'Database update failed', error: updateError } 
      })
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du mot de passe.' }, { status: 500 })
    }

    // Log successful password change
    auditLog({ 
      action: 'admin_password_set', 
      user: slug, 
      details: { context: 'authenticated_session' } 
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in set-password API:', error)
    auditLog({ 
      action: 'set_password_failed', 
      user: 'unknown', 
      details: { reason: 'Internal server error', error } 
    })
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
