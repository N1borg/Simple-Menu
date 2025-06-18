import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MenuPage({ params }: PageProps) {
  // Await params to get the slug
  const { slug } = await params
  
  // Await cookies() before using it
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
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
    <MenuDisplay establishment={establishment} />
  )
}
