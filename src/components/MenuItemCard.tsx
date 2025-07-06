import type { Category, MenuItem } from '@/types/supabase_types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from 'react'
import { toast } from "sonner"
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm"

interface MenuItemCardProps {
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

export default function MenuItemCard({
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
}: MenuItemCardProps) {
  // Use the establishment color if provided, fallback to blue
  const ringColor = establishmentColor || '#3a4fff'

  // Local state for dialog editing
  const [localName, setLocalName] = useState(item.name)
  const [localDescription, setLocalDescription] = useState(item.description || '')
  const [localPrice, setLocalPrice] = useState(item.price?.toFixed(2) ?? '')
  const [localAvailable, setLocalAvailable] = useState(!!item.is_available)

  // --- NEW: Track availability for instant UI update on card ---
  // This state is synced with the dialog switch, so the card updates instantly
  const [instantAvailable, setInstantAvailable] = useState(!!item.is_available)

  // Reset local state when dialog opens
  useEffect(() => {
    if (editingItem === item.id) {
      setLocalName(item.name)
      setLocalDescription(item.description || '')
      setLocalPrice(item.price?.toFixed(2) ?? '')
      setLocalAvailable(!!item.is_available)
      setInstantAvailable(!!item.is_available)
    }
  }, [editingItem, item])

  // When dialog closes without saving, reset instantAvailable to DB value
  useEffect(() => {
    if (editingItem !== item.id) {
      setInstantAvailable(!!item.is_available)
    }
  }, [editingItem, item.is_available, item.id])

  // When the switch is toggled, update both local and instant state
  const handleAvailableChange = (val: boolean) => {
    setLocalAvailable(val)
    setInstantAvailable(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    // Parse price, allow comma or dot
    let parsedPrice = parseFloat(localPrice.replace(',', '.'))
    if (isNaN(parsedPrice)) parsedPrice = 0
    // Prepare updated item
    const updatedItem = {
      ...item,
      name: localName,
      description: localDescription,
      price: parsedPrice,
      is_available: localAvailable,
    }
    try {
      await saveItem(updatedItem)
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde de l'élément")
    }
    // After save, keep instantAvailable in sync with DB value
    setInstantAvailable(!!localAvailable)
  }

  // Title fade logic (unchanged)
  const titleSpanRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = titleSpanRef.current
    if (!el) return
    const fade = el.querySelector('.fade-title') as HTMLElement | null
    if (!fade) return
    const updateFade = () => {
      if (el.scrollWidth > el.clientWidth) {
        fade.style.display = 'block'
      } else {
        fade.style.display = 'none'
      }
    }
    updateFade()
    const resizeObserver = new window.ResizeObserver(updateFade)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [item.name])

  // Description fade logic: only show fade if more than one line
  const descRef = useRef<HTMLParagraphElement>(null)
  const [showDescFade, setShowDescFade] = useState(false)
  useEffect(() => {
    const el = descRef.current
    if (!el) return
    const checkOverflow = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
      // Only show fade if more than one line
      setShowDescFade(el.scrollHeight > lineHeight * 1.5 + 2)
    }
    checkOverflow()
    const resizeObserver = new window.ResizeObserver(checkOverflow)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [item.description])

  return (
    <Dialog open={editingItem === item.id} onOpenChange={open => {
      if (!open && editingItem === item.id) setEditingItem(null)
      if (open) setEditingItem(item.id)
    }}>
      <div className="relative group">
        <div
          className={
            `bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group-hover:ring-2 transition cursor-pointer min-h-[7.5em]${!instantAvailable ? " bg-gray-100 text-gray-400 border border-gray-200" : ""}`
          }
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
          <div className="flex justify-between items-start">
            <h3
              className={`text-lg font-semibold max-w-[100%] overflow-hidden whitespace-nowrap relative`}
              title={item.name}
              style={{ textOverflow: 'clip' }}
            >
              <span ref={titleSpanRef} className={!instantAvailable ? 'line-through' : ''} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                {item.name}
                <span
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '4em',
                    height: '100%',
                    background: 'linear-gradient(to right, transparent, #fff 80%)',
                    pointerEvents: 'none',
                    display: 'none',
                  }}
                  className="fade-title"
                />
              </span>
            </h3>
          </div>
          {/* Content area with flex-1 to push price down */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="relative min-h-[2.5em] max-h-[2.5em]">
              {item.description ? (
                <p
                  ref={descRef}
                  className={`text-sm mt-1 overflow-hidden${!instantAvailable ? ' line-through' : ' text-gray-500'}`}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    position: 'relative',
                  }}
                >
                  {item.description}
                  {showDescFade && instantAvailable && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: '25%',
                        height: '1.2em',
                        background: 'linear-gradient(to right, transparent, #fff 70%)',
                        pointerEvents: 'none',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 70%)',
                        maskImage: 'linear-gradient(to right, transparent, black 70%)',
                        display: 'block',
                      }}
                    />
                  )}
                </p>
              ) : (
                <div className="text-sm mt-1 select-none min-h-[2.5em] max-h-[2.5em]" style={{color: 'transparent', textDecoration: 'none'}}>&nbsp;</div>
              )}
            </div>
            <div className={`text-right font-bold mt-2${!instantAvailable ? ' line-through' : ''}`}>
              {item.price?.toFixed(2)}€
            </div>
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
