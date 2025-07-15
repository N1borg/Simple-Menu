import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function requireAdminAuth(req: NextRequest): Promise<{ slug: string } | NextResponse> {
  const token = req.cookies.get('admin-session')?.value || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: "Non autorisé - Token manquant" }, { status: 401 })
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    const slug = payload.slug as string
    if (!slug) throw new Error('Slug manquant dans le token')
    return { slug }
  } catch (e) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 })
  }
}
