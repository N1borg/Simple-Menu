import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { auditLog } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  
  // Allow demo login but with demo password
  if (slug === 'demo') {
    if (password !== 'demo') {
      auditLog({ action: 'demo_login_failed', ip, user: slug, details: { reason: 'wrong_password' } })
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }
    
    // Create JWT for demo
    const token = await new SignJWT({ slug: 'demo' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET))

    auditLog({ action: 'demo_login_success', ip, user: slug })
    
    const response = NextResponse.json({ success: true, message: 'Connexion demo réussie' })
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    })
    return response
  }
  const supabase = await getServerSupabase()

  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('admin_hash')
    .eq('slug', slug)
    .single()

  if (error || !establishment || typeof establishment.admin_hash !== 'string') {
    auditLog({ action: 'login_failed', ip, user: slug, details: { error } })
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 404 })
  }

  const valid = await bcrypt.compare(password, establishment.admin_hash)
  if (!valid) {
    auditLog({ action: 'login_failed', ip, user: slug, details: { reason: 'Mot de passe invalide' } })
    return NextResponse.json({ error: 'Mot de passe invalide' }, { status: 401 })
  }

  // Create JWT with slug in payload
  const jwt = await new SignJWT({ slug })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(JWT_SECRET))

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin-session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  auditLog({ action: 'login_success', ip, user: slug })
  return res
}
