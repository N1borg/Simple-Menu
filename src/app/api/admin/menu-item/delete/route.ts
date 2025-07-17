import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, isValidUUID, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  const { id, slug: reqSlug } = await req.json()
  // Blocage des modifications en mode démo
  if (isDemoSlug(reqSlug)) {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }
  // Validation de l'entrée
  if (!isValidUUID(id)) {
    return NextResponse.json({ success: false, error: 'ID invalide' }, { status: 400 })
  }
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  if (!id) {
    auditLog({ action: 'menu_item_delete_failed', ip, details: { error: 'ID requis' } })
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) {
    auditLog({ action: 'menu_item_delete_failed', ip, details: { id, error } })
    
    // Return more specific error messages
    let errorMessage = 'Erreur lors de la suppression de l\'élément'
    
    if (error.code === '23503') { // Foreign key constraint violation
      errorMessage = 'Impossible de supprimer cet élément car il est référencé ailleurs'
    } else if (error.code === '42P01') { // Table doesn't exist
      errorMessage = 'Service temporairement indisponible'
    } else if (error.message && error.message.includes('establishment')) {
      errorMessage = 'Établissement introuvable'
    } else if (error.message) {
      // Use the actual error message if it's descriptive
      errorMessage = error.message
    }
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
  auditLog({ action: 'menu_item_delete', ip, details: { id } })
  return NextResponse.json({ success: true }, { status: 200 })
}
