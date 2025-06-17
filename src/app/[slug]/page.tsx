import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MenuDisplay from '@/components/MenuDisplay'

export const dynamic = 'force-dynamic'

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies()
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
    .eq('slug', params.slug)
    .single()

  if (!establishment) {
    return <div>Restaurant non trouvé</div>
  }

  return (
    <MenuDisplay establishment={establishment} />
  )
}
