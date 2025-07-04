import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Category, MenuItem } from '@/types/supabase_types'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useRef, useState } from 'react'
import { Loader2Icon } from "lucide-react"
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

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
}

export default function MenuItemList({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let parsedPrice = parseFloat(localPrice.replace(',', '.'))
    if (isNaN(parsedPrice)) parsedPrice = 0
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
    setInstantAvailable(!!localAvailable)
  }

  // No fade logic for list view, just plain text

  return (
    <Dialog open={editingItem === item.id} onOpenChange={open => {
      if (!open && editingItem === item.id) setEditingItem(null)
      if (open) setEditingItem(item.id)
    }}>
      <div className="relative group">
        {/* Menu Item Content - improved list style */}
        <div
          className={`flex items-center gap-4 p-4 rounded-lg shadow-sm border bg-white hover:bg-gray-50 transition cursor-pointer min-h-[5.1em] mb-3 ${!instantAvailable ? 'bg-gray-100 text-gray-400 line-through' : ''}`}
          style={{ outline: 'none', ...(editingItem === item.id ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}) }}
          onClick={() => setEditingItem(item.id)}
          tabIndex={0}
          role="button"
          aria-label={`Modifier l'élément ${item.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditingItem(item.id) }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base truncate" title={item.name}>{item.name}</span>
            </div>
            {item.description && (
              <div className="text-sm text-gray-500 truncate mt-1" title={item.description}>{item.description}</div>
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
