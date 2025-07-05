import type { Database } from '@/types/supabase'

export type MenuItem = Database['public']['Tables']['menu_items']['Row'] & {
  isLoading?: boolean // Indicates if the item is a temporary skeleton
}
export type Category = Database['public']['Tables']['categories']['Row'] & {
  menu_items: MenuItem[]
  isLoading?: boolean
}
export type Establishment = Database['public']['Tables']['establishments']['Row'] & {
  categories: Category[]
}

export type MenuDisplayProps = {
  establishment: Establishment
}
