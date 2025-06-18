import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'
import { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
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
