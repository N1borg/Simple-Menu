import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import AdminDashboard from '@/components/AdminDashboard'
import AdminLoginForm from '@/components/AdminLoginForm'
import { Database, EstablishmentWithCategories } from '@/types/supabase'
import Link from 'next/link'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AdminPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: establishment, error } = await supabase
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

  if (error || !establishment) {
    return <div className="p-8 text-center">Établissement non trouvé</div>
  }

  // Check single session cookie
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Administration - {establishment.name}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connectez-vous pour gérer votre menu
            </p>
          </div>
          <AdminLoginForm slug={slug} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end p-4">
        <Link
          href={`/${slug}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voir la page menu publique
        </Link>
      </div>
      <AdminDashboard
        establishment={establishment as EstablishmentWithCategories}
      />
    </div>
  )
}
