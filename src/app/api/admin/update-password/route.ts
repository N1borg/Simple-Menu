import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { auditLog } from '@/lib/security'
import { jwtVerify } from 'jose'
import { requireAdminAuth } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  const { establishmentId, currentPassword, newPassword } = await req.json()
  if (!establishmentId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
  }
  // Blocage des modifications en mode démo
  if (slug === 'demo') {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }
  const supabase = await getServerSupabase()
  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('admin_hash')
    .eq('id', establishmentId)
    .single()
  if (error || !establishment || typeof establishment.admin_hash !== 'string') {
    return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 })
  }
  const valid = await bcrypt.compare(currentPassword, establishment.admin_hash)
  if (!valid) {
    auditLog({ action: 'admin_password_change_failed', user: slug, details: { reason: 'Mot de passe actuel invalide' } })
    return NextResponse.json({ error: 'Mot de passe actuel invalide.' }, { status: 401 })
  }
  const newHash = await bcrypt.hash(newPassword, 10)
  const { error: updateError } = await supabase
    .from('establishments')
    .update({ admin_hash: newHash })
    .eq('id', establishmentId)
  if (updateError) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
  auditLog({ action: 'admin_password_changed', user: slug })
  return NextResponse.json({ success: true })
}
