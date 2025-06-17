import type { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type Category = Database['public']['Tables']['categories']['Row'] & {
  menu_items: MenuItem[]
}
type Establishment = Database['public']['Tables']['establishments']['Row'] & {
  categories: Category[]
}

export type MenuDisplayProps = {
  establishment: Establishment
}
