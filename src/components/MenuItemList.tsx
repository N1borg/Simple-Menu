import type { Category, MenuItem } from '@/types/supabase_types'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from 'react'
import { toast } from "sonner"
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm"
import { useCart } from '@/components/hooks/useCart'
import MenuItemDialog from '@/components/MenuItemDialog'
import DietaryBadge from '@/components/DietaryBadge'

interface MenuItemListProps {
  item: MenuItem
  category: Category
  editingItem: string | null
  setEditingItem: (id: string | null) => void
  handleItemChange?: (catId: string, itemId: string, field: string, value: any) => void
  saveItem: (item: MenuItem) => Promise<void>
  savingItemId: string | null
  loadingAction: string | null
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>
  establishmentColor?: string
  isAdmin?: boolean // New prop to control admin features
  isDemo?: boolean
  basketEnabled?: boolean // New prop to control basket checkbox visibility
  hideDietaryBadges?: { vegan?: boolean; alcoholFree?: boolean } // Hide badges if category has them
}

export default function MenuItemList({
  item,
  category,
  editingItem,
  setEditingItem,
  saveItem,
  savingItemId,
  loadingAction,
  deleteMenuItem,
  establishmentColor,
  isAdmin = true, // Default to admin mode for backward compatibility
  isDemo = false,
  basketEnabled = true, // Default to enabled for backward compatibility
  hideDietaryBadges = { vegan: false, alcoholFree: false }
}: MenuItemListProps) {
  // Use the establishment color if provided, fallback to blue
  const ringColor = establishmentColor || '#3a4fff'
  
  // Cart functionality - only use in non-admin mode
  const cartHook = !isAdmin ? useCart() : null
  const addToCart = cartHook?.addToCart
  const removeFromCart = cartHook?.removeFromCart
  const isInCart = cartHook?.isInCart

  // Local state for dialog editing
  const [localName, setLocalName] = useState(item.name)
  const [localDescription, setLocalDescription] = useState(item.description || '')
  const [localPrice, setLocalPrice] = useState(item.price_one?.toFixed(2) ?? '')
  const [localAvailable, setLocalAvailable] = useState(!!item.is_available)
  const [instantAvailable, setInstantAvailable] = useState(!!item.is_available)

  useEffect(() => {
    if (editingItem === item.id) {
      setLocalName(item.name)
      setLocalDescription(item.description || '')
      setLocalPrice(item.price_one?.toFixed(2) ?? '')
      setLocalAvailable(!!item.is_available)
      setInstantAvailable(!!item.is_available)
    }
  }, [editingItem, item])

  useEffect(() => {
    if (editingItem !== item.id) {
      setInstantAvailable(!!item.is_available)
    }
  }, [editingItem, item.is_available, item.id])

  const handleAvailableChange = (val: boolean) => {
    setLocalAvailable(val)
    setInstantAvailable(val)
  }

  return (
    <Dialog open={editingItem === item.id} onOpenChange={open => {
      if (!open && editingItem === item.id) setEditingItem(null)
      if (open) setEditingItem(item.id)
    }}>
      <div className="menu-item-card relative group">
        {/* Menu Item Content - improved list style */}
        <div
          className={`flex items-center gap-4 p-4 rounded-xl shadow-md border bg-white group-hover:ring-2 transition cursor-pointer min-h-[5.1em] mb-3 ${!instantAvailable ? 'bg-gray-100 text-gray-400 line-through border border-gray-200' : ''}`}
          style={{
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
            borderColor: 'transparent',
            outline: 'none',
            ...(editingItem === item.id ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}),
          }}
          onClick={() => setEditingItem(item.id)}
          tabIndex={0}
          role="button"
          aria-label={isAdmin ? `Modifier l'élément ${item.name}` : `Voir l'élément ${item.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditingItem(item.id) }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${ringColor}`
          }}
          onMouseLeave={e => {
            if (editingItem !== item.id) e.currentTarget.style.boxShadow = '0 1px 4px 0 rgba(0,0,0,0.07)'
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold max-w-[100%] truncate" title={item.name}>{item.name}</span>
            </div>
            {item.description && (
              <div className="text-sm text-gray-500 truncate mt-1 relative" title={item.description}>
                {item.description}
                <span
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '3em',
                    height: '100%',
                    background: 'linear-gradient(to right, transparent, #fff 80%)',
                    pointerEvents: 'none',
                    display: 'block',
                  }}
                />
              </div>
            )}
            {/* Dietary badges - only show if not hidden by category */}
            <div className="flex gap-1 mt-1">
              {item.vegan && !hideDietaryBadges.vegan && <DietaryBadge type="vegan" size="sm" />}
              {item.alcohol_free && !hideDietaryBadges.alcoholFree && <DietaryBadge type="alcohol-free" size="sm" />}
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[70px] gap-2">
            <span className="font-bold">{item.price_one?.toFixed(2)}€</span>
            {!isAdmin && basketEnabled && (
              <Checkbox
                checked={isInCart?.(item.id) || false}
                onCheckedChange={(checked) => {
                  if (checked && addToCart) {
                    addToCart(item)
                  } else if (!checked && removeFromCart) {
                    removeFromCart(item.id)
                  }
                }}
                accentColor={establishmentColor}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>

        {/* Show admin dialog or public dialog using reusable component */}
        <MenuItemDialog
          item={item}
          category={category}
          isAdmin={isAdmin}
          isDemo={isDemo}
          savingItemId={savingItemId}
          loadingAction={loadingAction}
          saveItem={saveItem}
          deleteMenuItem={deleteMenuItem}
          setEditingItem={setEditingItem}
          setInstantAvailable={setInstantAvailable}
          basketEnabled={basketEnabled}
          isInCart={isInCart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          establishmentColor={establishmentColor}
        />
      </div>
    </Dialog>
  )
}
