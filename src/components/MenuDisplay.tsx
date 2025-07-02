'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { MenuDisplayProps, Category, MenuItem } from '@/types/supabase_types'
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
        <div className="mt-4 text-right font-bold text-lg">{item.price?.toFixed(2)}€</div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-4 w-full">Fermer</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

function renderMenuItem(item: MenuItem, category: Category, establishmentColor?: string) {
  const [open, setOpen] = useState(false)
  const ringColor = establishmentColor || '#3a4fff'
  return (
    <>
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group transition cursor-pointer"
        style={{
          boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
          borderColor: 'transparent',
          outline: 'none',
        }}
        tabIndex={0}
        role="button"
        aria-label={`Voir l'élément ${item.name}`}
        onClick={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(true) }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${ringColor}`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 4px 0 rgba(0,0,0,0.07)'
        }}
      >
        <h3 className="text-lg font-semibold max-w-[100%] overflow-hidden whitespace-nowrap relative" title={item.name} style={{ textOverflow: 'clip' }}>{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', position: 'relative' }}>{item.description}</p>
        )}
        <div className="text-right font-bold mt-2">{item.price.toFixed(2)}€</div>
      </div>
      <MenuItemDialog item={item} open={open} onOpenChange={setOpen} />
    </>
  )
}

function renderCardStyle(category: Category, establishmentColor?: string) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => renderMenuItem(item, category, establishmentColor))}
      </div>
    </section>
  )
}

function renderListStyle(category: Category, establishmentColor?: string) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      <ul className="space-y-1">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => (
            <li key={item.id} className="list-none">
              {renderMenuItem(item, category, establishmentColor)}
            </li>
          ))}
      </ul>
    </section>
  )
}

function renderCompactStyle(category: Category, establishmentColor?: string) {
  return (
    <section key={category.id} className="max-w-2xl mx-auto px-2 py-4">
      <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
      <div className="flex flex-wrap gap-2">
        {category.menu_items
          ?.filter((item: MenuItem) => item.is_available)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(item => renderMenuItem(item, category, establishmentColor))}
      </div>
    </section>
  )
}

function renderTableStyle(category: Category, establishmentColor?: string) {
  return (
    <section key={category.id} className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
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
            .map(item => renderMenuItem(item, category, establishmentColor))}
        </tbody>
      </table>
    </section>
  )
}

function renderCategoryByStyle(category: Category, establishmentColor?: string) {
  switch (category.display_style) {
    case 'list':
      return renderListStyle(category)
    case 'compact':
      return renderCompactStyle(category)
    case 'table':
      return renderTableStyle(category)
    case 'card':
    default:
      return renderCardStyle(category, establishmentColor)
  }
}

export default function MenuDisplay({ establishment }: MenuDisplayProps) {
  const establishmentColor = establishment.primary_color || '#3a4fff'
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
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(category => {
            const sortedCategory = {
              ...category,
              menu_items: category.menu_items?.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) || []
            };
            return renderCategoryByStyle(sortedCategory, establishmentColor);
          })}
      </div>
    </div>
  )
}
