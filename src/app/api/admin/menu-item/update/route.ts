import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { auditLog } from '@/lib/security'
import { sanitizeString, sanitizeNumber, isValidUUID, isDemoSlug } from '@/lib/validate'
import { jwtVerify } from 'jose'
import { requireSecureAdminAuth } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET not defined')

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug
  const item = await req.json()
  // Blocage des modifications en mode démo
  if (isDemoSlug(item.slug)) {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }
  // Input validation & sanitization
  if (!isValidUUID(item.id)) {
    return NextResponse.json(false, { status: 400 })
  }
  const name = sanitizeString(item.name, 100)
  const description = sanitizeString(item.description, 500)
  const price = sanitizeNumber(item.price, 0, 10000)
  const is_available = !!item.is_available
  const display_order = sanitizeNumber(item.display_order, 0, 1000)
  const category_id = item.category_id
  const display_style = sanitizeString(item.display_style, 20)
  const supabase = await getServerSupabase()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  const { error } = await supabase
    .from('menu_items')
    .update({
      name,
      description,
      price,
      is_available,
      display_order,
      category_id,
      display_style,
    })
    .eq('id', item.id)

  if (error) {
    auditLog({ action: 'menu_item_update_failed', ip, details: { item, error } })
    
    // Return more specific error messages
    let errorMessage = 'Erreur lors de la mise à jour de l\'élément'
    
    if (error.code === '23503') { // Foreign key constraint violation
      errorMessage = 'Catégorie introuvable'
    } else if (error.code === '23505') { // Unique constraint violation
      errorMessage = 'Un élément avec ce nom existe déjà dans cette catégorie'
    } else if (error.message && error.message.includes('establishment')) {
      errorMessage = 'Établissement introuvable'
    } else if (error.message) {
      // Use the actual error message if it's descriptive
      errorMessage = error.message
    }
    
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
  auditLog({ action: 'menu_item_update', ip, details: { item } })
  return NextResponse.json({ success: true }, { status: 200 })
}
