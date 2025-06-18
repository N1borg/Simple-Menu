import { getServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'
import { Database } from '@/types/supabase'
import Link from 'next/link'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = cookies()
  const supabase = await getServerSupabase()

  const token = (await cookieStore).get('admin-session')?.value
  let isAuthenticated = false
  let tokenSlug: string | undefined

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      tokenSlug = payload.slug as string
      isAuthenticated = tokenSlug === slug
    } catch {
      isAuthenticated = false
    }
  }
  
  const { data: establishment } = await supabase
    .from('establishments')
    .select(`
      *,
      categories (
        *,
        menu_items (*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (!establishment) {
    return <div>Restaurant non trouvé</div>
  }

  return (
    <div>
      {isAuthenticated && <div className="flex justify-end p-4">
        <Link
          href={`/${slug}/admin`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
          Voir la page d'administration
        </Link>
      </div>}
      <MenuDisplay establishment={establishment} />
    </div>
  )
}
