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
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
