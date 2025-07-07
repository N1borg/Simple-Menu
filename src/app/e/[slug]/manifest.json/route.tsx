import { getServerSupabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
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

  const manifest = {
    name: `Menu – ${establishment.name}`,
    short_name: establishment.name,
    start_url: `/e/${slug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: establishment.primary_color || '#1f2937',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
