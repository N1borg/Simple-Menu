'use client'

import Image from 'next/image'
import type { MenuDisplayProps } from '@/types/supabase_types'
import BadgeLegend from '@/components/BadgeLegend'
import CategorySection from '@/components/CategorySection'

export default function MenuDisplay({ establishment, textColor }: MenuDisplayProps) {
  const establishmentColor = establishment.primary_color || '#3a4fff'
  const [editingItem, setEditingItem] = useState<string | null>(null)
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        {establishment.logo_url && (
          <Image
            src={establishment.logo_url}
            alt="Logo"
            width={160}
            height={160}
            className="mx-auto w-32 h-32 rounded-full mb-2 object-contain bg-white"
            priority
            quality={90}
            sizes="(max-width: 600px) 100vw, 160px"
          />
        )}
        <h1 
          className="text-3xl font-bold"
          style={{ color: establishmentTextColor }}
        >
          {establishment.name}
        </h1>
      </div>
      <div className="space-y-8 mb-8">
        {establishment.categories
          ?.filter(category => category.is_available !== false)
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(category => {
            const sortedCategory = {
              ...category,
              menu_items: category.menu_items?.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || []
            };
            return renderCategoryByStyle(sortedCategory, establishmentColor, editingItem, setEditingItem);
          })}
      </div>

      {/* Badge Legend */}
      <BadgeLegend categories={establishment.categories || []} />
    </div>
  )
}
