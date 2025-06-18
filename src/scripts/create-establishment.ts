import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function createEstablishment(data: {
  name: string
  slug: string
  adminPassword: string
  logo_url?: string
  primary_color?: string
}) {
  const hashedPassword = await hashPassword(data.adminPassword)

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
    throw new Error(`Error creating establishment: ${error.message}`)
  }

  return establishment
}
