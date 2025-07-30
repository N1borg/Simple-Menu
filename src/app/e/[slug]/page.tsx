import type { Metadata } from "next";
import { getServerSupabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await getServerSupabase();
  const { data: establishment } = await supabase
    .from('establishments')
    .select('name')
    .eq('slug', slug)
    .single();

  const name = establishment?.name || slug;

  return {
    title: `${name} | Simple-Menu`,
    description: `Découvrez le menu digital de ${name} sur Simple-Menu.`,
    openGraph: {
      title: `${name} | Simple-Menu`,
      description: `Découvrez le menu digital de ${name} sur Simple-Menu.`,
      url: `https://simple-menu.niborgpro.fr/e/${slug}`,
      siteName: "Simple-Menu",
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: "https://simple-menu.niborgpro.fr/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Simple-Menu - Menu digital",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Simple-Menu`,
      description: `Découvrez le menu digital de ${name} sur Simple-Menu.`,
      images: ["https://simple-menu.niborgpro.fr/og-image.jpg"],
    },
    alternates: {
      canonical: `https://simple-menu.niborgpro.fr/e/${slug}`,
    },
  };
}
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'
import NotFound from '@/app/not-found'
import { jwtVerify } from 'jose'
import AdminBanner from '@/components/AdminBanner'
import MenuFooter from '@/components/MenuFooter'
import { redirect } from 'next/navigation'
import { EstablishmentThemeProvider } from '@/contexts/EstablishmentThemeContext'
import Basket from '@/components/Basket'
import { CartProvider } from '@/components/hooks/useCart'

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
        <CartProvider>
          <Basket 
            establishmentColor={establishment.primary_color ?? undefined}
            isAdminView={isAuthenticated || slug === 'demo'}
            basketEnabled={establishment.basket_enabled ?? true}
            adminBannerPresent={isAuthenticated || slug === 'demo'}
          />
          <main className="flex-grow">
            <MenuDisplay 
              establishment={establishment}
            />
          </main>
        </CartProvider>
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
