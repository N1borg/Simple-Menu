import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'

export async function POST(req: NextRequest) {
  const item = await req.json()
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
      display_order: item.display_order,
      category_id: item.category_id,
      display_style: item.display_style,
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
