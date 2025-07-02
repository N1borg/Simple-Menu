import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const item = await req.json()
  // Advanced demo mode protection
  if (isDemoSlug(item.slug)) {
    return NextResponse.json({ success: false, error: 'Modification désactivée en mode démo.' }, { status: 403 })
  }
  // Input validation & sanitization
  const name = sanitizeString(item.name, 100)
  const description = sanitizeString(item.description, 500)
  const price = sanitizeNumber(item.price, 0, 10000)
  const is_available = !!item.is_available
  const display_order = sanitizeNumber(item.display_order, 0, 1000)
  const category_id = item.category_id
  const display_style = sanitizeString(item.display_style, 20)
  if (!name || !category_id) {
    return NextResponse.json({ success: false, error: 'Nom et catégorie requis' }, { status: 400 })
  }
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name,
      description,
      price,
      is_available,
      display_order,
      category_id,
      display_style,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    auditLog({ action: 'menu_item_create_failed', ip, details: { item, error } })
    console.error('Erreur création menu_item:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  auditLog({ action: 'menu_item_create', ip, details: { item, created: data } })
  return NextResponse.json({ success: true, item: data }, { status: 201 })
}
