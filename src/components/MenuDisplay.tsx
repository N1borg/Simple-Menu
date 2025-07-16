'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MenuDisplayProps, Category, MenuItem } from '@/types/supabase_types'
import MenuItemCard from '@/components/MenuItemCard'
import MenuItemList from '@/components/MenuItemList'
import MenuItemCompact from '@/components/MenuItemCompact'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function MenuItemDialog({ item, open, onOpenChange }: { item: MenuItem, open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>
            {item.description || 'Aucune description.'}
          </DialogDescription>
        </DialogHeader>
        {item.image_url && (
          <div className="flex justify-center">
            <Image
              src={item.image_url}
              alt={item.name}
              width={300}
              height={200}
              className="rounded-lg object-cover max-h-48"
            />
          </div>
        )}
        <div className="mt-4 text-right font-bold text-lg">{item.price?.toFixed(2)}€</div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-4 w-full">Fermer</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

function renderCardStyle(category: Category, establishmentColor?: string, textColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 
        className="text-2xl font-bold mb-4"
        style={{ color: textColor || undefined }}
      >
        {category.name}
      </h2>
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
              textColor={textColor}
              isAdmin={false} // Public view
              isDemo={false}
            />
          ))}
      </div>
    </section>
  )
}

function renderListStyle(category: Category, establishmentColor?: string, textColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 
        className="text-xl font-bold mb-2"
        style={{ color: textColor || undefined }}
      >
        {category.name}
      </h2>
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
                textColor={textColor}
                isAdmin={false} // Public view
                isDemo={false}
              />
            </li>
          ))}
      </ul>
    </section>
  )
}

function renderCompactStyle(category: Category, establishmentColor?: string, textColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  return (
    <section key={category.id} className="max-w-2xl mx-auto px-2 py-4">
      <h2 
        className="text-lg font-semibold mb-4"
        style={{ color: textColor || undefined }}
      >
        {category.name}
      </h2>
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
              textColor={textColor}
              isAdmin={false} // Public view
              isDemo={false}
            />
          ))}
      </div>
    </section>
  )
}

function renderTableStyle(category: Category, establishmentColor?: string, textColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 
        className="text-xl font-bold mb-2"
        style={{ color: textColor || undefined }}
      >
        {category.name}
      </h2>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th 
              className="border-b p-2"
              style={{ color: textColor || undefined }}
            >
              Nom
            </th>
            <th 
              className="border-b p-2"
              style={{ color: textColor || undefined }}
            >
              Description
            </th>
            <th 
              className="border-b p-2 text-right"
              style={{ color: textColor || undefined }}
            >
              Prix
            </th>
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
                <td 
                  className="border-b p-2 font-medium"
                  style={{ color: textColor || undefined }}
                >
                  {item.name}
                </td>
                <td 
                  className="border-b p-2 text-sm text-gray-600"
                  style={{ color: textColor ? `${textColor}80` : undefined }}
                >
                  {item.description || '-'}
                </td>
                <td 
                  className="border-b p-2 text-right font-bold"
                  style={{ color: textColor || undefined }}
                >
                  {item.price?.toFixed(2)}€
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  )
}

function renderCategoryByStyle(category: Category, establishmentColor?: string, textColor?: string, editingItem?: string | null, setEditingItem?: (id: string | null) => void) {
  switch (category.display_style) {
    case 'list':
      return renderListStyle(category, establishmentColor, textColor, editingItem, setEditingItem)
    case 'compact':
      return renderCompactStyle(category, establishmentColor, textColor, editingItem, setEditingItem)
    case 'table':
      return renderTableStyle(category, establishmentColor, textColor, editingItem, setEditingItem)
    case 'card':
    default:
      return renderCardStyle(category, establishmentColor, textColor, editingItem, setEditingItem)
  }
}

export default function MenuDisplay({ establishment, textColor }: MenuDisplayProps) {
  const establishmentColor = establishment.primary_color || '#3a4fff'
  const establishmentTextColor = textColor || '#1f2937'
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
      <div className="space-y-8">
        {establishment.categories
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(category => {
            const sortedCategory = {
              ...category,
              menu_items: category.menu_items?.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || []
            };
            return renderCategoryByStyle(sortedCategory, establishmentColor, establishmentTextColor, editingItem, setEditingItem);
          })}
      </div>
      
      {/* Show item dialog for table style when an item is selected */}
      {editingItem && (
        (() => {
          const selectedItem = establishment.categories
            ?.flatMap(cat => cat.menu_items || [])
            .find(item => item.id === editingItem);
          return selectedItem ? (
            <MenuItemDialog 
              item={selectedItem} 
              open={!!editingItem} 
              onOpenChange={(open) => !open && setEditingItem(null)} 
            />
          ) : null;
        })()
      )}
    </div>
  )
}
