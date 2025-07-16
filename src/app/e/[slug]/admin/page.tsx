import { getServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'
import AdminLoginForm from '@/components/AdminLoginForm'
import { EstablishmentWithCategories } from '@/types/supabase_types'
import AdminBanner from '@/components/AdminBanner'
import MenuFooter from '@/components/MenuFooter'
import { PaymentStatusBanner } from '@/components/PaymentStatusBanner'
import { PaymentStatusToast } from '@/components/PaymentStatusToast'
import Image from 'next/image'
import NotFound from '@/app/not-found'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non défini dans les variables d\'environnement')
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const cookieStore = await cookies()
  const supabase = await getServerSupabase()

  // Check for payment status in URL params
  const paymentStatus = searchParamsResolved.payment as string
  const sessionId = searchParamsResolved.session_id as string

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
    return NotFound()
  }

  // 🚨 SECURITY CHECK: Block access to inactive or unpaid establishments
  if (slug !== 'demo' && (!establishment.is_active || establishment.plan_status === 'pending_payment')) {
    redirect(`/payment-required?slug=${slug}`)
  }

  // Block access if subscription canceled/inactive
  if (slug !== 'demo' && (establishment.plan_status === 'canceled' || establishment.plan_status === 'inactive')) {
    return NotFound()
  }

  const token = cookieStore.get('admin-session')?.value
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

  if (!isAuthenticated && slug !== 'demo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            {establishment.logo_url && (
              <Image
                src={establishment.logo_url}
                alt={`Logo de ${establishment.name}`}
                width={120}
                height={120}
                className="mb-4 w-28 h-28 object-contain rounded-full bg-white"
                priority
                quality={90}
                sizes="(max-width: 600px) 100vw, 120px"
              />
            )}
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Administration - {establishment.name}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connectez-vous pour gérer votre menu
            </p>
          </div>
            <AdminLoginForm slug={slug} color={establishment.primary_color ?? undefined} />
          </div>
      </div>
    )
  }

  // Check if setup is needed and redirect (only for authenticated users, not demo)
  const needsSetup = !establishment.primary_color && slug !== 'demo' && isAuthenticated
  if (needsSetup) {
    redirect(`/e/${slug}/admin/setup`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PaymentStatusToast />
      {(isAuthenticated || slug === 'demo') && (
        <>
          <div className="tutorial-admin-banner">
            <AdminBanner slug={slug} isDashboard color={establishment.primary_color ?? undefined} />
          </div>
          {/* Payment Status Banner */}
          {paymentStatus && (
            <div className="max-w-6xl mx-auto px-4 mt-4">
              <PaymentStatusBanner 
                paymentStatus={paymentStatus}
                sessionId={sessionId}
                establishmentSlug={slug}
              />
            </div>
          )}
        </>
      )}
      <div className="flex-grow">
        <AdminDashboard
          establishment={establishment as EstablishmentWithCategories}
        />
      </div>
      <MenuFooter 
        color={establishment.primary_color ?? undefined} 
        establishmentInfo={{
          address: establishment.address ?? undefined,
          phone: establishment.phone ?? undefined,
          email: establishment.email ?? undefined,
          opening_hours: establishment.opening_hours as Array<{ day: string; hours: string }> ?? undefined,
          facebook_url: establishment.facebook_url ?? undefined,
          instagram_url: establishment.instagram_url ?? undefined,
          google_maps_url: establishment.google_maps_url ?? undefined
        }}
      />
    </div>
  )
}
