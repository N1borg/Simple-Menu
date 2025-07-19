'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MenuDisplayProps, Category, MenuItem } from '@/types/supabase_types'
import MenuItemCard from '@/components/MenuItemCard'
import MenuItemList from '@/components/MenuItemList'
import MenuItemCompact from '@/components/MenuItemCompact'
import Basket from '@/components/Basket'
import { CartProvider } from '@/components/hooks/useCart'
import DietaryBadge from '@/components/DietaryBadge'

// Helper function to check dietary attributes for a category
function getCategoryDietaryAttributes(category: Category) {
  // First check if the category itself has dietary attributes
  if (category.vegan || category.alcohol_free) {
    return { 
      vegan: !!category.vegan, 
      alcoholFree: !!category.alcohol_free 
    }
  }
  
  // If category doesn't have attributes, check if all items have the same attributes
  const availableItems = category.menu_items?.filter(item => item.is_available) || []
  if (availableItems.length === 0) return { vegan: false, alcoholFree: false }
  
  const allVegan = availableItems.every(item => item.vegan)
  const allAlcoholFree = availableItems.every(item => item.alcohol_free)
  
  return { vegan: allVegan, alcoholFree: allAlcoholFree }
}

function renderCardStyle(category: Category, establishmentColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void, basketEnabled?: boolean) {
  const categoryDietary = getCategoryDietaryAttributes(category)
  
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold">{category.name}</h2>
        {/* Category-level dietary badges */}
        <div className="flex gap-1">
          {categoryDietary.vegan && <DietaryBadge type="vegan" />}
          {categoryDietary.alcoholFree && <DietaryBadge type="alcohol-free" />}
        </div>
      </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.menu_items
            ?.filter((item: MenuItem) => item.is_available)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                category={category}
                editingItem={editingItem || null}
                setEditingItem={setEditingItem || (() => {})}
                saveItem={async () => {}} // No-op for public view
                savingItemId={null}
                loadingAction={null}
                deleteMenuItem={async () => {}} // No-op for public view
                establishmentColor={establishmentColor}
                isAdmin={false} // Public view
                isDemo={false}
                basketEnabled={basketEnabled}
                hideDietaryBadges={{
                  vegan: categoryDietary.vegan,
                  alcoholFree: categoryDietary.alcoholFree
                }}
              />
            ))}
        </div>
    </section>
  )
}

function renderListStyle(category: Category, establishmentColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void, basketEnabled?: boolean) {
  const categoryDietary = getCategoryDietaryAttributes(category)
  
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">{category.name}</h2>
        {/* Category-level dietary badges */}
        <div className="flex gap-1">
          {categoryDietary.vegan && <DietaryBadge type="vegan" />}
          {categoryDietary.alcoholFree && <DietaryBadge type="alcohol-free" />}
        </div>
      </div>
      <ul className="space-y-1">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                      .map(item => (
              <li key={item.id} className="list-none">
                <MenuItemList
                  item={item}
                  category={category}
                  editingItem={editingItem || null}
                  setEditingItem={setEditingItem || (() => {})}
                  handleItemChange={() => {}} // No-op for public view
                  saveItem={async () => {}} // No-op for public view
                  savingItemId={null}
                  loadingAction={null}
                  deleteMenuItem={async () => {}} // No-op for public view
                  establishmentColor={establishmentColor}
                  isAdmin={false} // Public view
                  isDemo={false}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                />
              </li>
            ))}
      </ul>
    </section>
  )
}

function renderCompactStyle(category: Category, establishmentColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void, basketEnabled?: boolean) {
  const categoryDietary = getCategoryDietaryAttributes(category)
  
  return (
    <section key={category.id} className="max-w-2xl mx-auto px-2 py-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">{category.name}</h2>
        {/* Category-level dietary badges */}
        <div className="flex gap-1">
          {categoryDietary.vegan && <DietaryBadge type="vegan" />}
          {categoryDietary.alcoholFree && <DietaryBadge type="alcohol-free" />}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-full">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                      .map(item => (
              <MenuItemCompact
                key={item.id}
                item={item}
                category={category}
                editingItem={editingItem || null}
                setEditingItem={setEditingItem || (() => {})}
                saveItem={async () => {}} // No-op for public view
                savingItemId={null}
                loadingAction={null}
                deleteMenuItem={async () => {}} // No-op for public view
                establishmentColor={establishmentColor}
                isAdmin={false} // Public view
                isDemo={false}
                basketEnabled={basketEnabled}
                hideDietaryBadges={{
                  vegan: categoryDietary.vegan,
                  alcoholFree: categoryDietary.alcoholFree
                }}
              />
            ))}
      </div>
    </section>
  )
}

function renderTableStyle(category: Category, establishmentColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  const categoryDietary = getCategoryDietaryAttributes(category)
  
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">{category.name}</h2>
        {/* Category-level dietary badges */}
        <div className="flex gap-1">
          {categoryDietary.vegan && <DietaryBadge type="vegan" />}
          {categoryDietary.alcoholFree && <DietaryBadge type="alcohol-free" />}
        </div>
      </div>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border-b p-2">Nom</th>
            <th className="border-b p-2">Description</th>
            <th className="border-b p-2 text-right">Prix</th>
          </tr>
        </thead>
        <tbody>
          {category.menu_items
            ?.filter((item: MenuItem) => item.is_available)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map(item => (
              <tr 
                key={item.id}
                className="cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setEditingItem?.(item.id)}
                style={{
                  boxShadow: editingItem === item.id ? `0 0 0 2px ${establishmentColor || '#3a4fff'}` : 'none'
                }}
              >
                <td className="border-b p-2 font-medium">{item.name}</td>
                <td className="border-b p-2 text-sm text-gray-600">{item.description || '-'}</td>
                <td className="border-b p-2 text-right font-bold">{item.price_one?.toFixed(2)}€</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  )
}

function renderCategoryByStyle(category: Category, establishmentColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void, basketEnabled?: boolean) {
  switch (category.display_style) {
    case 'list':
      return renderListStyle(category, establishmentColor, editingItem, setEditingItem, basketEnabled)
    case 'compact':
      return renderCompactStyle(category, establishmentColor, editingItem, setEditingItem, basketEnabled)
    case 'table':
      return renderTableStyle(category, establishmentColor, editingItem, setEditingItem)
    case 'card':
    default:
      return renderCardStyle(category, establishmentColor, editingItem, setEditingItem, basketEnabled)
  }
}

export default function MenuDisplay({ establishment, isAdminView = false, basketEnabled = true }: MenuDisplayProps & { isAdminView?: boolean; basketEnabled?: boolean }) {
  const establishmentColor = establishment.primary_color || '#3a4fff'
  const [editingItem, setEditingItem] = useState<string | null>(null)
  
  return (
    <CartProvider>
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
            ?.filter(category => category.is_available !== false) // Hide only explicitly disabled categories (false)
            ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map(category => {
              const sortedCategory = {
                ...category,
                menu_items: category.menu_items?.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || []
              };
              return renderCategoryByStyle(sortedCategory, establishmentColor, editingItem, setEditingItem, basketEnabled);
            })}
        </div>

        {/* Shopping basket with style tester */}
        <Basket 
          establishmentColor={establishmentColor} 
          isAdminView={isAdminView}
          basketEnabled={basketEnabled}
        />
      </div>
    </CartProvider>
  )
}
