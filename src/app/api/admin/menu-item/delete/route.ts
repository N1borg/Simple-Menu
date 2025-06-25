import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
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
