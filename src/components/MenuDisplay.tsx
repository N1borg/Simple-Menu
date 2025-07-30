'use client'

import Image from 'next/image'
import type { MenuDisplayProps } from '@/types/supabase_types'
import BadgeLegend from '@/components/BadgeLegend'
import CategorySection from '@/components/CategorySection'

export default function MenuDisplay({ establishment }: MenuDisplayProps) {
  const establishmentColor = establishment.primary_color || '#3a4fff'
  const basketEnabled = establishment.basket_enabled ?? true

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
        <h1 className="text-3xl font-bold">{establishment.name}</h1>
      </div>
      <div className="space-y-8">
        {establishment.categories
          ?.filter(category => category.is_available !== false)
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(category => (
            <CategorySection
              key={category.id}
              category={category}
              isDemo={false}
              isAdmin={false}
              editingCategoryId={null}
              setEditingCategoryId={() => {}}
              originalCategory={null}
              setOriginalCategory={() => {}}
              savingCategoryId={null}
              loadingAction={null}
              categories={establishment.categories}
              setCategories={() => {}}
              saveCategory={async () => {}}
              establishmentColor={establishmentColor}
              deleteCategory={async () => {}}
              subscription={undefined}
              isAddingItemGlobally={false}
              setIsAddingItemGlobally={() => {}}
              basketEnabled={basketEnabled}
            />
          ))}
      </div>

      {/* Badge Legend */}
      <BadgeLegend categories={establishment.categories || []} />
    </div>
  )
}
