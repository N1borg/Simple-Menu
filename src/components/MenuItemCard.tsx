import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, GripVertical } from "lucide-react"
import { SortableHandle } from './SortableHandle'
import type { Category, MenuItem } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveItem(item)
  }

  return (
    <div className="relative group">
      {/* Menu Item Content */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group-hover:ring-2 ring-blue-400 transition">
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

      {/* Action Buttons - overlayed, only visible on hover */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Drag Handle */}
        <SortableHandle id={item.id}>
          <GripVertical className="w-4 h-4 text-gray-400" />
        </SortableHandle>

        {/* Edit Button */}
        <Popover 
          open={editingItem === item.id} 
          onOpenChange={open => setEditingItem(open ? item.id : null)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="opacity-70 hover:opacity-100" 
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modifier l'élément</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
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
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={savingItemId === item.id || loadingAction !== null}
                >
                  {savingItemId === item.id ? (
                    <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                  ) : "Enregistrer"}
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setEditingItem(null)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>

        {/* Delete Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-70 hover:opacity-100"
              onClick={() => setConfirmDelete({ type: 'item', catId: category.id, itemId: item.id })}
              title="Supprimer l'élément"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supprimer l'élément</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
