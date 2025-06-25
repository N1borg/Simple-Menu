import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, isValidUUID, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  // Advanced demo mode protection
  if (isDemoSlug(req.nextUrl.searchParams.get('slug'))) {
    return NextResponse.json({ success: false, error: 'Suppression interdite en mode démo.' }, { status: 403 })
  }
  // Input validation
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
    console.error('Erreur suppression menu_item:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  auditLog({ action: 'menu_item_delete', ip, details: { id } })
  return NextResponse.json({ success: true }, { status: 200 })
}
