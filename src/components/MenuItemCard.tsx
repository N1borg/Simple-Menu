import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SortableHandle } from './SortableHandle'
import type { Category, MenuItem } from '@/types/supabase_types'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from 'react'
import { Loader2Icon, Trash2 } from "lucide-react"
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

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
}

export default function MenuItemCard({
  item,
  category,
  editingItem,
  setEditingItem,
  handleItemChange,
  saveItem,
  savingItemId,
  loadingAction,
  deleteMenuItem,
  establishmentColor
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
      toast.success("Élément sauvegardé !")
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
        {/* Menu Item Content - clickable to open dialog */}
        <div
          className={
            `bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group-hover:ring-2 transition cursor-pointer ${!instantAvailable ? 'bg-gray-100 text-gray-400 line-through border border-gray-200' : ''}`
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
              className="text-lg font-semibold max-w-[100%] overflow-hidden whitespace-nowrap relative"
              title={item.name}
              style={{ textOverflow: 'clip' }}
            >
              <span ref={titleSpanRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
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
          {item.description && (
            <p
              ref={descRef}
              className={`text-sm mt-1 overflow-hidden ${!instantAvailable ? 'italic' : 'text-gray-500'}`}
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
          )}
          <div className="text-right font-bold mt-2">
            {item.price?.toFixed(2)}€
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
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Nom</Label>
              <Input
                value={localName}
                onChange={e => setLocalName(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={localDescription}
                onChange={e => setLocalDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Prix</Label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={localPrice}
                placeholder="0.00"
                onChange={e => {
                  // Allow only numbers and one dot or comma
                  const val = e.target.value.replace(/[^0-9.,]/g, '')
                  setLocalPrice(val)
                }}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Switch
                  checked={localAvailable}
                  onCheckedChange={handleAvailableChange}
                />
                Disponible
              </Label>
            </div>
            <DialogFooter>
              <div className="flex w-full justify-between gap-2">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <ConfirmDeleteDialog
                          onConfirm={async () => {
                            try {
                              await deleteMenuItem(category.id, item.id)
                              toast.success("Élément supprimé !")
                            } catch (err) {
                              toast.error("Erreur lors de la suppression de l'élément")
                            }
                            setEditingItem(null)
                          }}
                          title="Supprimer l'élément ?"
                          description="Cette action supprimera cet élément du menu. Voulez-vous continuer ?"
                          triggerButtonClassName="mr-auto flex items-center justify-center"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supprimer l'élément</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={savingItemId === item.id || loadingAction !== null}>
                    {savingItemId === item.id ? (
                      <>
                        <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  )
}
