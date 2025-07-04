import type { Category, MenuItem } from '@/types/supabase_types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from 'react'
import { toast } from "sonner"
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm"

interface MenuItemListProps {
  item: MenuItem
  category: Category
  editingItem: string | null
  setEditingItem: (id: string | null) => void
  handleItemChange: (catId: string, itemId: string, field: string, value: any) => void
  saveItem: (item: MenuItem) => Promise<void>
  savingItemId: string | null
  loadingAction: string | null
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>
  establishmentColor?: string
  isDemo?: boolean
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
  isDemo = false
}: MenuItemListProps) {
  // Use the establishment color if provided, fallback to blue
  const ringColor = establishmentColor || '#3a4fff'

  // Local state for dialog editing
  const [localName, setLocalName] = useState(item.name)
  const [localDescription, setLocalDescription] = useState(item.description || '')
  const [localPrice, setLocalPrice] = useState(item.price?.toFixed(2) ?? '')
  const [localAvailable, setLocalAvailable] = useState(!!item.is_available)
  const [instantAvailable, setInstantAvailable] = useState(!!item.is_available)

  useEffect(() => {
    if (editingItem === item.id) {
      setLocalName(item.name)
      setLocalDescription(item.description || '')
      setLocalPrice(item.price?.toFixed(2) ?? '')
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
      <div className="relative group">
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
          aria-label={`Modifier l'élément ${item.name}`}
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
              <span className="font-semibold text-base truncate" title={item.name}>{item.name}</span>
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
          </div>
          <div className="flex flex-col items-end min-w-[70px]">
            <span className="font-bold text-lg">{item.price?.toFixed(2)}€</span>
          </div>
        </div>

        {/* Dialog for editing item */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'élément</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'élément puis cliquez sur enregistrer.
            </DialogDescription>
          </DialogHeader>
          <MenuItemDialogForm
            item={item}
            isDemo={isDemo}
            savingItemId={savingItemId}
            loadingAction={loadingAction}
            onSubmit={async (updatedItem) => {
              try {
                await saveItem(updatedItem)
              } catch (err) {
                toast.error("Erreur lors de la sauvegarde de l'élément")
              }
              setInstantAvailable(!!updatedItem.is_available)
              setEditingItem(null)
            }}
            onDelete={async () => {
              if (isDemo) {
                toast.info("Modification désactivée (mode démo).")
                return
              }
              try {
                await deleteMenuItem(category.id, item.id)
              } catch (err) {
                toast.error("Erreur lors de la suppression de l'élément")
              }
              setEditingItem(null)
            }}
            onCancel={() => setEditingItem(null)}
          />
        </DialogContent>
      </div>
    </Dialog>
  )
}
