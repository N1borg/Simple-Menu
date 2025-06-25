import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'

export async function POST(req: NextRequest) {
  const item = await req.json()
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { error } = await supabase
    .from('menu_items')
    .update({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
      display_order: item.display_order,
      category_id: item.category_id,
      display_style: item.display_style,
    })
    .eq('id', item.id)

  if (error) {
    auditLog({ action: 'menu_item_update_failed', ip, details: { item, error } })
    return NextResponse.json(false, { status: 500 })
  }
  auditLog({ action: 'menu_item_update', ip, details: { item } })
  return NextResponse.json(true, { status: 200 })
}
