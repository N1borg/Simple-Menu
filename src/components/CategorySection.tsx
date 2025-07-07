import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, Plus, Pencil } from "lucide-react"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableItem } from '@/components/SortableItem'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import MenuItemCard from '@/components/MenuItemCard'
import MenuItemList from '@/components/MenuItemList'
import MenuItemCompact from '@/components/MenuItemCompact';
import type { Category, MenuItem } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRef, useEffect, useState } from 'react'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Loader2Icon } from "lucide-react"
import { useMenuItems } from '@/components/hooks/useMenuItems'
import { toast } from "sonner"
import CategorySkeleton from "@/components/CategorySkeleton"
import MenuItemSkeleton from "@/components/MenuItemSkeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      toast.info("Modification désactivée (mode démo).");
      return;
    }

    // Add a temporary skeleton item
    const newCategories = categories.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            menu_items: [
              ...cat.menu_items,
              {
                id: `temp-${Date.now()}`,
                category_id: catId,
                created_at: null,
                description: null,
                display_order: cat.menu_items.length,
                display_style: category.display_style || "card",
                image_url: null,
                is_available: null,
                name: "",
                order: null,
                price: 0,
                isLoading: true,
              },
            ],
          }
        : cat
    );
    setCategories(newCategories);

    // Call the API to add the item
    const newItem = await addMenuItem(catId);

    // Replace the skeleton with the real item
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: cat.menu_items.map((item) =>
                item.id.startsWith("temp-") && newItem && typeof newItem === "object" && !Array.isArray(newItem)
                  ? { ...(newItem as MenuItem), isLoading: false }
                  : item
              ),
            }
          : cat
      )
    );
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

  // Removed fade logic for category title
  const renderCategoryHeader = () => {
    if (editingCategoryId === category.id) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              originalCategory &&
              category.name === originalCategory.name &&
              category.display_style === originalCategory.display_style
            ) {
              setEditingCategoryId(null);
              return;
            }
            saveCategory(category);
          }}
          className="flex items-center gap-2 flex-wrap"
        >
          <Input
            value={category.name}
            onChange={(e) => {
              const newCategories = categories.map((c) =>
                c.id === category.id ? { ...c, name: e.target.value } : c
              );
              setCategories(newCategories);
            }}
            className="w-40"
          />
          <Select
            onValueChange={(value) => {
              const newCategories = categories.map((c) =>
                c.id === category.id ? { ...c, display_style: value } : c
              );
              setCategories(newCategories);
            }}
            value={category.display_style || ""}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger className="w-[120px] bg-white cursor-pointer">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sélectionnez un style</p>
              </TooltipContent>
            </Tooltip>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Styles</SelectLabel>
                {DISPLAY_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            size="sm"
            disabled={savingCategoryId === category.id || loadingAction !== null}
            className="cursor-pointer"
          >
            {savingCategoryId === category.id || loadingAction === `saveCategory-${category.id}` ? (
              <>
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setEditingCategoryId(null)}
            className="cursor-pointer"
          >
            Annuler
          </Button>
        </form>
      );
    }

    return (
      <>
        <h2
          className="text-2xl font-bold mr-2 mb-2 sm:mb-0 overflow-hidden whitespace-nowrap"
          style={{ textOverflow: "clip", maxWidth: "100%" }}
          title={category.name}
        >
          {category.name}
        </h2>
        <Select
          onValueChange={async (value) => {
            const newCategories = categories.map((c) =>
              c.id === category.id ? { ...c, display_style: value } : c
            );
            setCategories(newCategories);
            await saveCategory({ ...category, display_style: value });
          }}
          value={category.display_style || ""}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger className="w-[120px] bg-white cursor-pointer">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sélectionnez un style</p>
            </TooltipContent>
          </Tooltip>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Styles</SelectLabel>
              {DISPLAY_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => handleAddMenuItem(category.id)}
              variant="ghost"
              size="icon"
              title="Nouvel élément"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
              disabled={category.id.startsWith("temp-")}
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
                setEditingCategoryId(category.id);
                setOriginalCategory({ ...category });
              }}
              title="Modifier la catégorie"
              className="cursor-pointer"
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
                  await deleteCategory(category.id);
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
    );
  }

  if (category.isLoading) {
    return (
    <section className="max-w-4xl mx-auto px-4 py-6">
      <CategorySkeleton />
    </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Drag handle for category */}
        <button
          type="button"
          className="dnd-handle-cat cursor-pointer p-0 flex items-center justify-center rounded hover:bg-gray-200 focus:outline-none w-9 h-9"
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
        renderOverlay={(activeId) => {
          const item: MenuItem | undefined = category.menu_items.find((i: MenuItem) => i.id === activeId);
          if (!item) return null;
          
          switch (category.display_style) {
            case "list":
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
              );
            case "compact":
              return (
                <MenuItemCompact
                  item={item}
                  category={category}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                />
              );
            case "table":
              return (
                <MenuItemSkeleton displayStyle="table" />
              );
            default:
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
              );
          }
        }}
      >
        <div
          className={
            category.display_style === "card"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full"
              : category.display_style === "compact"
              ? "grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-full"
              : "max-w-full"
          }
        >
          {[...category.menu_items]
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item) => (
              <SortableItem key={item.id} id={item.id}>
          {item.isLoading ? (
            <MenuItemSkeleton displayStyle={item.display_style as "card" | "list" | "compact" | "table"} />
          ) : category.display_style === "list" ? (
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
          ) : category.display_style === "compact" ? (
            <MenuItemCompact
              item={item}
              category={category}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              // handleItemChange={handleItemChange}
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
          <MenuItemSkeleton displayStyle="compact" />
        </div>
      </DndKitWrapper>
    </section>
  )
}
