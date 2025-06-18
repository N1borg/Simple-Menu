import { getServerSupabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function createEstablishment(data: {
  name: string
  slug: string
  adminPassword: string
  logo_url?: string
  primary_color?: string
}) {
  const hashedPassword = await hashPassword(data.adminPassword)
  const supabase = await getServerSupabase()

  const { data: establishment, error } = await supabase
    .from('establishments')
    .insert({
      name: data.name,
      slug: data.slug,
      admin_hash: hashedPassword,
      logo_url: data.logo_url,
      primary_color: data.primary_color || '#3B82F6'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur lors de la création de l'établissement : ${error.message}`)
  }

  return establishment
}
