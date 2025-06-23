import { getServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import AdminDashboard from '@/components/AdminDashboard'
import AdminLoginForm from '@/components/AdminLoginForm'
import { EstablishmentWithCategories } from '@/types/supabase'
import Link from 'next/link'
import AdminBanner from '@/components/AdminBanner'
import Image from 'next/image'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AdminPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = cookies()
  const supabase = await getServerSupabase()

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
          <div className="flex flex-col items-center">
            {establishment.logo_url && (
              <Image
                src={establishment.logo_url}
                alt={`Logo de ${establishment.name}`}
                width={100}
                height={100}
                className="mb-4 w-24 h-24 object-contain rounded-full"
                priority
              />
            )}
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
      {isAuthenticated && <AdminBanner slug={slug} isDashboard />}
      <AdminDashboard
        establishment={establishment as EstablishmentWithCategories}
      />
    </div>
  )
}
