import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  const baseUrl = req.nextUrl.origin
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug for redirect.' }, { status: 400 })
  }
  const redirectUrl = `${baseUrl}/e/${slug}/admin`
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
