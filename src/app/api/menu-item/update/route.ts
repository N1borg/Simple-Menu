import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const item = await req.json()
  const supabase = await getServerSupabase()

  const { error } = await supabase
    .from('menu_items')
    .update({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
    })
    .eq('id', item.id)

  if (error) return NextResponse.json(false, { status: 500 })

  return NextResponse.json(true, { status: 200 })
}
