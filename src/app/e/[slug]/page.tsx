import { getServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'
import NotFound from '@/app/not-found'
import { jwtVerify } from 'jose'
import AdminBanner from '@/components/AdminBanner'
import MenuFooter from '@/components/MenuFooter'
import { redirect } from 'next/navigation'
import { EstablishmentThemeProvider } from '@/contexts/EstablishmentThemeContext'

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
  const cookieStore = await cookies()
  const supabase = await getServerSupabase()

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

  return (
    <EstablishmentThemeProvider primaryColor={establishment.primary_color}>
      <div className="min-h-screen flex flex-col">
        {(isAuthenticated || slug === 'demo') && <AdminBanner slug={slug} color={establishment.primary_color ?? undefined} />}
        <main className="flex-grow">
          <MenuDisplay 
            establishment={establishment} 
            isAdminView={isAuthenticated || slug === 'demo'}
            basketEnabled={establishment.basket_enabled ?? true}
          />
        </main>
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
    </EstablishmentThemeProvider>
  )
}
