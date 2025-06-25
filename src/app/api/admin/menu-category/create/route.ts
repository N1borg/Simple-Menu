import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'

export async function POST(req: NextRequest) {
  const { name, display_style, display_order, establishment_id } = await req.json()
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  if (!name || !establishment_id) {
    auditLog({ action: 'category_create_failed', ip, details: { error: 'Nom et établissement requis' } })
    return NextResponse.json({ success: false, error: 'Nom et établissement requis' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, display_style, display_order, establishment_id }])
    .select()
    .single()

  if (error) {
    auditLog({ action: 'category_create_failed', ip, details: { name, error } })
    console.error('Erreur création catégorie:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
  auditLog({ action: 'category_create', ip, details: { name, created: data } })
  return NextResponse.json({ success: true, category: data }, { status: 200 })
}
