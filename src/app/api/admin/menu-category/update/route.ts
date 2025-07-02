import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const { id, name, display_style, display_order, slug } = await req.json()
  // Advanced demo mode protection
  if (isDemoSlug(slug)) {
    return NextResponse.json({ success: false, error: 'Modification désactivée en mode démo.' }, { status: 403 })
  }
  // Input validation & sanitization
  if (!isValidUUID(id)) {
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }
  const safeName = sanitizeString(name, 100)
  const safeStyle = sanitizeString(display_style, 20)
  const safeOrder = sanitizeNumber(display_order, 0, 1000)
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  if (!id) {
    auditLog({ action: 'category_update_failed', ip, details: { error: 'ID requis' } })
    return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
  }

  const { error } = await supabase
    .from('categories')
    .update({ name: safeName, display_style: safeStyle, display_order: safeOrder })
    .eq('id', id)

  if (error) {
    auditLog({ action: 'category_update_failed', ip, details: { id, error } })
    console.error('Erreur update catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  auditLog({ action: 'category_update', ip, details: { id, name, display_style, display_order } })
  return NextResponse.json({ success: true }, { status: 200 })
}
