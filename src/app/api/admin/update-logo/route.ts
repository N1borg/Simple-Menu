import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    const { id, logo_url, slug } = await req.json()
    // Advanced demo mode protection
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Modification du logo interdite en mode démo.' }, { status: 403 })
    }
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const safeLogoUrl = sanitizeString(logo_url, 500)
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url: safeLogoUrl })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // Audit log: action, user, details
    await auditLog({
      action: 'update',
      user: slug,
      details: 'Logo updated via admin API.'
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, slug } = await req.json()
    if (isDemoSlug(slug)) {
      return NextResponse.json({ error: 'Suppression du logo interdite en mode démo.' }, { status: 403 })
    }
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url: null })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await auditLog({
      action: 'delete',
      user: slug,
      details: 'Logo deleted via admin API.'
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
