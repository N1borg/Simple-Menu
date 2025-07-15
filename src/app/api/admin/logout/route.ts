import { NextRequest, NextResponse } from 'next/server'
import { isDemoSlug } from '@/lib/validate'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug
  const { slug: bodySlug } = await req.json()
  const baseUrl = req.nextUrl.origin
  if (!bodySlug) {
    return NextResponse.json({ error: 'Missing slug for redirect.' }, { status: 400 })
  }
  // Blocage des modifications en mode démo
  if (bodySlug === 'demo') {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }
  const redirectUrl = `${baseUrl}/e/${bodySlug}/admin`
  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
