import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { isValidUUID, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const { id, slug } = await req.json()

  // Advanced demo mode protection
  if (isDemoSlug(slug)) {
    return NextResponse.json({ success: false, error: 'Suppression interdite en mode démo.' }, { status: 403 })
  }

  // Input validation
  if (!isValidUUID(id)) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  // Optionally: delete all menu_items in this category first
  await supabase.from('menu_items').delete().eq('category_id', id)

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    auditLog({ action: 'category_delete_failed', ip, details: { id, error } })
    console.error('Erreur suppression catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  auditLog({ action: 'category_delete', ip, details: { id } })
  return NextResponse.json({ success: true }, { status: 200 })
}
