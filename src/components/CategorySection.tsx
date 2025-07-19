import { Button } from "@/components/ui/button"
import { GripVertical, Plus, Pencil, Loader2, Crown } from "lucide-react"
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
import { useMenuItems } from '@/components/hooks/useMenuItems'
import { toast } from "sonner"
import CategorySkeleton from "@/components/CategorySkeleton"
import MenuItemSkeleton from "@/components/MenuItemSkeleton";
import { SubscriptionLimits } from '@/hooks/useSubscription'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryDialogForm } from "./CategoryDialogForm"
import DietaryBadge from '@/components/DietaryBadge'

interface CategorySectionProps {
  category: Category
  isDemo: boolean
  isAdmin?: boolean
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
  subscription?: SubscriptionLimits
  isAddingItemGlobally?: boolean
  setIsAddingItemGlobally?: (adding: boolean) => void
  basketEnabled?: boolean
}

export default function CategorySection({
  category,
  isDemo,
  isAdmin = true,
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
  subscription,
  isAddingItemGlobally = false,
  setIsAddingItemGlobally,
  basketEnabled = false,
}: CategorySectionProps) {
  // Helper function to check dietary attributes for a category
  const getCategoryDietaryAttributes = (category: Category) => {
    // Check if attributes are explicitly set on the category
    const categoryVegan = !!category.vegan
    const categoryAlcoholFree = !!category.alcohol_free
    
    // Check if all available items have the same attributes (for automatic badges)
    const availableItems = category.menu_items?.filter(item => item.is_available) || []
    const allVegan = availableItems.length > 0 && availableItems.every(item => item.vegan)
    const allAlcoholFree = availableItems.length > 0 && availableItems.every(item => item.alcohol_free)
    
    // Return true if explicitly set OR if all available items have it
    return { 
      vegan: categoryVegan || allVegan, 
      alcoholFree: categoryAlcoholFree || allAlcoholFree 
    }
  }

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
  
  // State for category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

  // Add item handler using the hook, with demo mode protection
  const handleAddMenuItem = async (catId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).");
      return;
    }

    // Check subscription limits before creating
    if (subscription && !subscription.canCreateMenuItem) {
      const maxItems = subscription.planConfig?.features.maxItems
      toast.error(`Limite d'éléments atteinte (${maxItems} max pour le plan ${subscription.planConfig?.name}). Passez à un plan supérieur pour ajouter plus d'éléments.`)
      // Open upgrade dialog
      window.open(
        'mailto:contact.simplemenu@gmail.com?subject=Upgrade%20Plan&body=Je%20souhaite%20passer%20à%20un%20plan%20supérieur%20pour%20ajouter%20plus%20d\'éléments%20de%20menu.',
        '_blank'
      )
      return;
    }

    // Set global loading state to disable all add buttons
    setIsAddingItemGlobally?.(true)

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
                price_one: 0,
                isLoading: true,
              },
            ],
          }
        : cat
    );
    setCategories(newCategories);

    try {
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
    } catch (error) {
      // Remove the temporary item on error
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === catId
            ? {
                ...cat,
                menu_items: cat.menu_items.filter((item) => !item.id.startsWith("temp-"))
              }
            : cat
        )
      );
      // Don't show toast here as addMenuItem already handles specific error messages
    } finally {
      // Reset global loading state
      setIsAddingItemGlobally?.(false);
    }
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

  // Handle category dialog form submission
  const handleCategorySubmit = async (updatedCategory: Category) => {
    try {
      // Ensure vegan and alcohol_free are properly included
      const categoryToSave = {
        ...updatedCategory,
        vegan: typeof updatedCategory.vegan === 'boolean' ? updatedCategory.vegan : false,
        alcohol_free: typeof updatedCategory.alcohol_free === 'boolean' ? updatedCategory.alcohol_free : false,
      }
      
      // Save to backend first
      await saveCategory(categoryToSave)
      
      // Only update local state after successful save
      const newCategories = categories.map((c) =>
        c.id === category.id ? categoryToSave : c
      )
      setCategories(newCategories)
      setIsCategoryDialogOpen(false)
    } catch (error) {
      // Error handling is done in saveCategory, don't update UI
      console.error('Failed to save category:', error)
    }
  }

  // Handle category deletion
  const handleCategoryDelete = async () => {
    await deleteCategory(category.id)
    setIsCategoryDialogOpen(false)
  }

  // Handle category dialog cancel
  const handleCategoryCancel = () => {
    setIsCategoryDialogOpen(false)
    // Reset any changes if needed
    if (originalCategory) {
      const newCategories = categories.map((c) =>
        c.id === category.id ? originalCategory : c
      )
      setCategories(newCategories)
    }
  }

  // Simplified category header render function
  const renderCategoryHeader = () => {
    const categoryUnavailable = category.is_available === false
    const categoryDietary = getCategoryDietaryAttributes(category)
    
    return (
      <>
        <div className="flex items-center gap-2 mr-2 mb-2 sm:mb-0">
          <h2
            className={`text-2xl font-bold overflow-hidden whitespace-nowrap ${
              categoryUnavailable ? 'text-gray-400 line-through' : ''
            }`}
            style={{ textOverflow: "clip", maxWidth: "100%" }}
            title={category.name}
          >
            {category.name}
          </h2>
        </div>
        <div className="tutorial-add-item">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleAddMenuItem(category.id)}
                variant="ghost"
                size="icon"
                title="Nouvel élément"
                className={`bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer relative ${
                  subscription && !subscription.canCreateMenuItem ? 'opacity-60 hover:opacity-80' : ''
                }`}
                disabled={category.id.startsWith("temp-") || isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {(isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : subscription && !subscription.canCreateMenuItem ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {(isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))) ? (
                <p>Ajout en cours...</p>
              ) : subscription && !subscription.canCreateMenuItem ? (
                <div className="text-center">
                  <p className="mb-1">Limite d'éléments atteinte</p>
                  <p className="text-xs">({subscription.planConfig?.features.maxItems} max pour le plan {subscription.planConfig?.name})</p>
                  <p className="text-xs text-blue-200 mt-1">Passez à un plan supérieur</p>
                </div>
              ) : (
                <p>Ajouter un élément</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setOriginalCategory({ ...category })
                setIsCategoryDialogOpen(true)
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
        {/* Category-level dietary badges - moved after buttons */}
        <div className="flex gap-1">
          {categoryDietary.vegan && (
            <DietaryBadge 
              type="vegan" 
              variant="active"
              showText={false}
            />
          )}
          {categoryDietary.alcoholFree && (
            <DietaryBadge 
              type="alcohol-free" 
              variant="active"
              showText={false}
            />
          )}
        </div>
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
    <section className="category-section max-w-4xl mx-auto px-4 py-6">
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
        id={`category-${category.id}`}
        items={category.menu_items}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleItemDragEnd}
        renderOverlay={(activeId) => {
          const item: MenuItem | undefined = category.menu_items.find((i: MenuItem) => i.id === activeId);
          if (!item) return null;
          
          const categoryDietary = getCategoryDietaryAttributes(category)
          
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
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
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
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
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
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
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
              isAdmin={isAdmin}
              basketEnabled={basketEnabled}
              hideDietaryBadges={{
                vegan: getCategoryDietaryAttributes(category).vegan,
                alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
              }}
              categoryIsAvailable={category.is_available !== false}
            />
          ) : category.display_style === "compact" ? (
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
              isAdmin={isAdmin}
              basketEnabled={basketEnabled}
              hideDietaryBadges={{
                vegan: getCategoryDietaryAttributes(category).vegan,
                alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
              }}
              categoryIsAvailable={category.is_available !== false}
            />
          ) : category.display_style === "table" ? (
            <MenuItemSkeleton displayStyle="table" />
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
              isAdmin={isAdmin}
              basketEnabled={basketEnabled}
              hideDietaryBadges={{
                vegan: getCategoryDietaryAttributes(category).vegan,
                alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
              }}
              categoryIsAvailable={category.is_available !== false}
            />
          )}
              </SortableItem>
            ))}
        </div>
      </DndKitWrapper>

      {/* Category Edit Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez le nom et le style d'affichage de votre catégorie.
            </DialogDescription>
          </DialogHeader>
          <CategoryDialogForm
            category={category}
            isDemo={isDemo}
            savingCategoryId={savingCategoryId}
            loadingAction={loadingAction}
            onSubmit={handleCategorySubmit}
            onDelete={handleCategoryDelete}
            onCancel={handleCategoryCancel}
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
