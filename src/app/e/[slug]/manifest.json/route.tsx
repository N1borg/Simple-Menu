import { getServerSupabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await getServerSupabase()
  const { slug } = await params

  // Vérifier l'authentification admin
  const authResult = await requireAdminAuth(req)
  if ('status' in authResult) {
    // Si l'utilisateur n'est pas authentifié, retourner un manifest sans PWA
    return new Response(
      JSON.stringify({
        name: 'Simple Menu',
        short_name: 'Menu',
        display: 'browser', // Pas de PWA sans auth
        start_url: `/e/${slug}`,
        background_color: '#ffffff',
        theme_color: '#1f2937',
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

  const { data: establishment, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !establishment) {
    return new Response('Establishment not found', { status: 404 })
  }

  if (slug === 'demo') {
    return new Response(
      JSON.stringify({
        name: 'Démo Simple Menu',
        short_name: 'Démo',
        display: 'browser',
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

  const manifest = {
    name: `Menu – ${establishment.name}`,
    short_name: establishment.name,
    start_url: `/e/${slug}`,
    display: isPwaAllowed ? 'standalone' : 'browser',
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
  }

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
