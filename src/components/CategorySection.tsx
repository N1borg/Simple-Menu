import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, Plus, Pencil } from "lucide-react"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableItem } from '@/components/SortableItem'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import MenuItemCard from '@/components/MenuItemCard'
import MenuItemList from '@/components/MenuItemList'
import type { Category, MenuItem } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRef, useEffect, useState } from 'react'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Loader2Icon } from "lucide-react"
import { useMenuItems } from '@/components/hooks/useMenuItems'
import { toast } from "sonner"

const DISPLAY_STYLES = [
  { value: 'card', label: 'Carte' },
  { value: 'list', label: 'Liste' },
  { value: 'compact', label: 'Compact' },
  { value: 'table', label: 'Tableau' },
]

interface CategorySectionProps {
  category: Category
  isDemo: boolean
  editingCategoryId: string | null
  setEditingCategoryId: (id: string | null) => void
  originalCategory: Category | null
  setOriginalCategory: (cat: Category | null) => void
  savingCategoryId: string | null
  loadingAction: string | null
  categories: any[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  saveCategory: (cat: any) => Promise<void>
  establishmentColor?: string
  deleteCategory: (catId: string) => Promise<void>
}

export default function CategorySection({
  category,
  isDemo,
  editingCategoryId,
  setEditingCategoryId,
  originalCategory,
  setOriginalCategory,
  savingCategoryId,
  loadingAction,
  categories,
  setCategories,
  saveCategory,
  establishmentColor,
  deleteCategory,
}: CategorySectionProps) {
  // Use useMenuItems hook for item actions
  const {
    saveItem,
    deleteMenuItem,
    handleItemChange,
    savingItemId,
    addMenuItem
  } = useMenuItems(categories, setCategories, isDemo)

  // Local state for editing item
  const [editingItem, setEditingItem] = useState<string | null>(null)

  // Add item handler using the hook, with demo mode protection
  const handleAddMenuItem = async (catId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    await addMenuItem(catId)
    // editingItem will be set by the hook after API returns
  }

  // Block delete item in demo mode
  const handleDeleteMenuItem = async (catId: string, itemId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    await deleteMenuItem(catId, itemId)
  }

  // Block save item in demo mode
  const handleSaveItem = async (updatedItem: MenuItem) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    await saveItem(updatedItem)
    setCategories(categories.map((cat: Category) =>
      cat.id === category.id
        ? {
            ...cat,
            menu_items: cat.menu_items.map((item: MenuItem) =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            )
          }
        : cat
    ))
  }

  const handleItemDragEnd = (oldIndex: number, newIndex: number) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    if (oldIndex === newIndex) return

    const sorted = [...category.menu_items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    const [moved] = sorted.splice(oldIndex, 1)
    sorted.splice(newIndex, 0, moved)
    sorted.forEach((item, idx) => (item.display_order = idx))
    
    const newCategories = categories.map(c =>
      c.id === category.id ? { ...c, menu_items: sorted } : c
    )
    setCategories(newCategories)

    // Persist order to API if not demo
    if (!isDemo) {
      sorted.forEach((item, idx) => {
        fetch('/api/admin/menu-item/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, display_order: idx }),
        })
      })
    }
  }

  // Fade logic for category title
  const catTitleRef = useRef<HTMLHeadingElement>(null)
  const [showCatTitleFade, setShowCatTitleFade] = useState(false)
  useEffect(() => {
    const el = catTitleRef.current
    if (!el) return
    const checkOverflow = () => {
      setShowCatTitleFade(el.scrollWidth > el.clientWidth)
    }
    checkOverflow()
    const resizeObserver = new window.ResizeObserver(checkOverflow)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [category.name])

  const renderCategoryHeader = () => {
    if (editingCategoryId === category.id) {
      return (
        <form
          onSubmit={e => {
            e.preventDefault()
            if (
              originalCategory &&
              category.name === originalCategory.name &&
              category.display_style === originalCategory.display_style
            ) {
              setEditingCategoryId(null)
              return
            }
            saveCategory(category)
          }}
          className="flex items-center gap-2 flex-wrap"
        >
          <Input
            value={category.name}
            onChange={e => {
              const newCategories = categories.map(c => c.id === category.id ? { ...c, name: e.target.value } : c)
              setCategories(newCategories)
            }}
            className="w-40"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Style: {DISPLAY_STYLES.find(style => style.value === category.display_style)?.label || 'Carte'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {DISPLAY_STYLES.map(style => (
                <DropdownMenuItem
                  key={style.value}
                  onClick={() => {
                    const newCategories = categories.map(c => c.id === category.id ? { ...c, display_style: style.value } : c)
                    setCategories(newCategories)
                  }}
                >
                  {style.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            type="submit" 
            size="sm" 
            disabled={savingCategoryId === category.id || loadingAction !== null}
          >
            {savingCategoryId === category.id || loadingAction === `saveCategory-${category.id}` ? (
              <>
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                Enregistrement...
              </>
            ) : "Enregistrer"}
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="secondary" 
            onClick={() => setEditingCategoryId(null)}
          >
            Annuler
          </Button>
        </form>
      )
    }

    return (
      <>
        <h2
          ref={catTitleRef}
          className="text-2xl font-bold mr-2 mb-2 sm:mb-0 overflow-hidden whitespace-nowrap relative"
          style={{ textOverflow: 'clip', maxWidth: '100%' }}
          title={category.name}
        >
          <span style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            {category.name}
            {showCatTitleFade && (
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
            )}
          </span>
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              Style: {DISPLAY_STYLES.find(style => style.value === category.display_style)?.label || 'Carte'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DISPLAY_STYLES.map(style => (
              <DropdownMenuItem
                key={style.value}
                onClick={async () => {
                  const newCategories = categories.map(c => c.id === category.id ? { ...c, display_style: style.value } : c)
                  setCategories(newCategories)
                  await saveCategory({ ...category, display_style: style.value })
                }}
              >
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleAddMenuItem(category.id)}
              variant="ghost"
              size="icon"
              title="Nouvel élément"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600"
              disabled={category.id.startsWith('temp-')}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ajouter un élément</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                setEditingCategoryId(category.id)
                setOriginalCategory({ ...category })
              }} 
              title="Modifier la catégorie"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modifier la catégorie</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ConfirmDeleteDialog
                onConfirm={async () => {
                  await deleteCategory(category.id)
                }}
                title="Supprimer la catégorie ?"
                description="Cette action supprimera la catégorie et tous ses éléments. Voulez-vous continuer ?"
                triggerButtonClassName="size-icon variant-ghost"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supprimer la catégorie</p>
          </TooltipContent>
        </Tooltip>
      </>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Drag handle for category */}
        <button 
          type="button" 
          className="dnd-handle-cat cursor-grab p-1 rounded hover:bg-gray-200 focus:outline-none" 
          title="Déplacer la catégorie"
          disabled={isDemo}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        
        {renderCategoryHeader()}
      </div>

      {/* Menu Items with Drag & Drop */}
      <DndKitWrapper
        items={category.menu_items}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleItemDragEnd}
        renderOverlay={activeId => {
          const item: MenuItem | undefined = category.menu_items.find((i: MenuItem) => i.id === activeId)
          if (!item) return null
          if (category.display_style === 'list') {
            return (
              <MenuItemList
                item={item}
                category={category}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                handleItemChange={handleItemChange}
                saveItem={handleSaveItem}
                savingItemId={savingItemId}
                loadingAction={loadingAction}
                deleteMenuItem={handleDeleteMenuItem}
                establishmentColor={establishmentColor}
                isDemo={isDemo}
              />
            )
          }
          return (
            <MenuItemCard
              item={item}
              category={category}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              handleItemChange={handleItemChange}
              saveItem={handleSaveItem}
              savingItemId={savingItemId}
              loadingAction={loadingAction}
              deleteMenuItem={handleDeleteMenuItem}
              establishmentColor={establishmentColor}
              isDemo={isDemo}
            />
          )
        }}
      >
        <div className={category.display_style === 'list' ? '' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {[...category.menu_items]
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {category.display_style === 'list' ? (
                  <MenuItemList
                    item={item}
                    category={category}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    handleItemChange={handleItemChange}
                    saveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    loadingAction={loadingAction}
                    deleteMenuItem={handleDeleteMenuItem}
                    establishmentColor={establishmentColor}
                    isDemo={isDemo}
                  />
                ) : (
                  <MenuItemCard
                    item={item}
                    category={category}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    handleItemChange={handleItemChange}
                    saveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    loadingAction={loadingAction}
                    deleteMenuItem={handleDeleteMenuItem}
                    establishmentColor={establishmentColor}
                    isDemo={isDemo}
                  />
                )}
              </SortableItem>
            ))}
        </div>
      </DndKitWrapper>
    </section>
  )
}
