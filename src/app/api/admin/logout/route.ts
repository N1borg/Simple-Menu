import { NextRequest, NextResponse } from 'next/server'
import { requireSecureAdminAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug
  const { slug: bodySlug } = await req.json()
  
  if (!bodySlug) {
    return NextResponse.json({ error: 'Missing slug for redirect.' }, { status: 400 })
  }
  
  // Blocage des modifications en mode démo
  if (bodySlug === 'demo') {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }
  
  // Clear the admin session cookie
  const response = NextResponse.json({ success: true, redirectUrl: `/e/${bodySlug}/admin` })
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  
  return response
}
