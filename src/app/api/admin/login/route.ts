import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json()
  const supabase = await getServerSupabase()

  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('admin_hash')
    .eq('slug', slug)
    .single()

  if (error || !establishment || typeof establishment.admin_hash !== 'string') {
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 404 })
  }

  const valid = await bcrypt.compare(password, establishment.admin_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Mot de passe invalide' }, { status: 401 })
  }

  // Create JWT with slug in payload
  const jwt = await new SignJWT({ slug })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(JWT_SECRET))

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin-session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2,
  })
  return res
}
