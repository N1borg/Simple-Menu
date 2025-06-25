import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'

export async function POST(req: NextRequest) {
  try {
    const { id, logo_url } = await req.json()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    if (!id) {
      auditLog({ action: 'update_logo_failed', ip, details: { error: 'ID manquant' } })
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url })
      .eq('id', id)
    if (error) {
      auditLog({ action: 'update_logo_failed', ip, details: { id, error: error.message } })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    auditLog({ action: 'update_logo', ip, details: { id, logo_url } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    auditLog({ action: 'update_logo_failed', ip, details: { error: e.message } })
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
