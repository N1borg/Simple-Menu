import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, GripVertical } from "lucide-react"
import { SortableHandle } from './SortableHandle'
import type { Category, MenuItem } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

interface MenuItemCardProps {
  item: MenuItem
  category: Category
  editingItem: string | null
  setEditingItem: (id: string | null) => void
  handleItemChange: (catId: string, itemId: string, field: string, value: any) => void
  saveItem: (item: MenuItem) => Promise<void>
  savingItemId: string | null
  loadingAction: string | null
  setConfirmDelete: (data: { type: 'category' | 'item', catId: string, itemId?: string } | null) => void
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
  setConfirmDelete
}: MenuItemCardProps) {
  
  // Get the color from category or fallback to establishment color if available
  const ringColor = (category as any).primary_color || '#000000'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveItem(item)
  }

  return (
    <Dialog open={editingItem === item.id} onOpenChange={open => setEditingItem(open ? item.id : null)}>
      <div className="relative group">
        {/* Menu Item Content - clickable to open dialog */}
        <div
          className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group-hover:ring-2 transition cursor-pointer"
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
              className="text-lg font-semibold truncate max-w-[70%]"
              title={item.name}
            >
              {item.name}
            </h3>
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
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
                value={item.name}
                onChange={e => handleItemChange(category.id, item.id, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={item.description || ''}
                onChange={e => handleItemChange(category.id, item.id, 'description', e.target.value)}
              />
            </div>
            <div>
              <Label>Prix</Label>
              <Input
                type="number"
                value={item.price?.toFixed(2) ?? ''}
                min={0}
                step={0.01}
                onChange={e => handleItemChange(category.id, item.id, 'price', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Switch
                  checked={!!item.is_available}
                  onCheckedChange={val => handleItemChange(category.id, item.id, 'is_available', val)}
                />
                Disponible
              </Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={savingItemId === item.id || loadingAction !== null}>
                {savingItemId === item.id ? (
                  <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : "Enregistrer"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="ml-auto"
                onClick={() => {
                  setEditingItem(null)
                  setConfirmDelete({ type: 'item', catId: category.id, itemId: item.id })
                }}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  )
}
