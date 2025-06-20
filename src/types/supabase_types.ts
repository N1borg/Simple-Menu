import type { Database } from '@/types/supabase'

export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Category = Database['public']['Tables']['categories']['Row'] & {
  menu_items: MenuItem[]
}
export type Establishment = Database['public']['Tables']['establishments']['Row'] & {
  categories: Category[]
}

export type MenuDisplayProps = {
  establishment: Establishment
}
