import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

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

export async function requireSecureAdminAuth(req: NextRequest): Promise<{ slug: string; establishment: any } | NextResponse> {
  // First check JWT authentication
  const authResult = await requireAdminAuth(req)
  if ('status' in authResult) {
    return authResult // Return the error response
  }
  
  const { slug } = authResult
  
  // Allow demo access
  if (slug === 'demo') {
    return { slug, establishment: { slug: 'demo', is_active: true, plan_status: 'active' } }
  }
  
  // Check establishment payment status
  const supabase = await getServerSupabase()
  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('id, slug, is_active, plan_status')
    .eq('slug', slug)
    .single()

  if (error || !establishment) {
    return NextResponse.json({ 
      error: 'Établissement non trouvé' 
    }, { status: 404 })
  }

  // Block access if not active or payment pending
  if (!establishment.is_active || establishment.plan_status === 'pending_payment') {
    return NextResponse.json({ 
      error: 'Accès restreint - Paiement requis',
      requirePayment: true,
      slug 
    }, { status: 402 })
  }

  return { slug, establishment }
}
