import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { id, logo_url } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from('establishments')
      .update({ logo_url })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
