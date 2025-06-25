import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isDemoSlug } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const { name, display_style, display_order, establishment_id, slug } = await req.json()
  // Advanced demo mode protection
  if (isDemoSlug(slug)) {
    return NextResponse.json({ success: false, error: 'Modification interdite en mode démo.' }, { status: 403 })
  }
  // Input validation & sanitization
  const safeName = sanitizeString(name, 100)
  const safeStyle = sanitizeString(display_style, 20)
  const safeOrder = sanitizeNumber(display_order, 0, 1000)
  if (!safeName || !establishment_id) {
    return NextResponse.json({ success: false, error: 'Nom et établissement requis' }, { status: 400 })
  }
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: safeName, display_style: safeStyle, display_order: safeOrder, establishment_id }])
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
