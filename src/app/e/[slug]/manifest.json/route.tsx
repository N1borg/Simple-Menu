import { getServerSupabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await getServerSupabase()
  const { slug } = await params

  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !establishment) {
    return new Response('Establishment not found', { status: 404 })
  }

  // Block demo from having PWA
  if (slug === 'demo') {
    return new Response(
      JSON.stringify({
        name: 'Démo Simple Menu',
        short_name: 'Démo',
        display: 'browser', // No PWA for demo
        start_url: `/e/demo`,
        background_color: '#ffffff',
        theme_color: establishment.primary_color || '#1f2937',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  }

  const plan = establishment.plan || 'essentiel'
  const isPwaAllowed = plan === 'pro' || plan === 'premium'

  // Require admin authentication for PWA manifest
  if (!isPwaAllowed) {
    // Not a pro/premium plan: return browser-only manifest
    return new Response(
      JSON.stringify({
        name: `Menu – ${establishment.name}`,
        short_name: establishment.name,
        display: 'browser', // No PWA for non-pro plans
        start_url: `/e/${slug}`,
        background_color: '#ffffff',
        theme_color: establishment.primary_color || '#1f2937',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/manifest+json; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  }

  // Require admin authentication for manifest access
  const adminAuth = await requireAdminAuth(req)
  if (!adminAuth || (adminAuth as any).slug !== slug) {
    // Not authenticated as admin for this establishment: block manifest
    return new Response('Forbidden', { status: 403 })
  }

  // Generate circular logo icons if establishment has a logo
  const generateIcon = (size: number) => {
    if (establishment.logo_url) {
      return {
        src: `/api/generate-icon?logo=${encodeURIComponent(establishment.logo_url)}&size=${size}`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any maskable'
      }
    }
    return {
      src: `/icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
    }
  }

  const manifest = {
    name: `Menu – ${establishment.name}`,
    short_name: establishment.name,
    start_url: `/e/${slug}/admin`, // Default to admin page
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: establishment.primary_color || '#1f2937',
    orientation: 'portrait',
    scope: `/e/${slug}/`,
    icons: [
      generateIcon(192),
      generateIcon(512),
      // Add more sizes for better compatibility
      generateIcon(72),
      generateIcon(96),
      generateIcon(128),
      generateIcon(144),
      generateIcon(152),
      generateIcon(180),
      generateIcon(384),
    ],
    categories: ['food', 'business'],
    lang: 'fr',
    dir: 'ltr',
  }

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
