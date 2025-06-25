import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const item = await req.json()
  const supabase = await getServerSupabase()

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
    console.error('Erreur création menu_item:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }

  return NextResponse.json({ success: true, item: data }, { status: 201 })
}
