import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  try {
    // Auth: get token from cookie or Authorization header
    const token = req.cookies.get('admin-session')?.value || req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: "Non autorisé - Token manquant" }, { status: 401 })
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      if (!payload.slug) throw new Error('Slug manquant dans le token')
    } catch (e) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
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
