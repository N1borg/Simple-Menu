import { Button } from "@/components/ui/button"
import { GripVertical, Plus, Pencil, Loader2, Crown, CopyPlus } from "lucide-react"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableItem } from '@/components/SortableItem'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import MenuItemCard from '@/components/MenuItemCard'
import MenuItemList from '@/components/MenuItemList'
import MenuItemCompact from '@/components/MenuItemCompact';
import type { Category, MenuItem } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from 'react'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { useMenuItems } from '@/components/hooks/useMenuItems'
import { toast } from "sonner"
import CategorySkeleton from "@/components/CategorySkeleton"
import MenuItemSkeleton from "@/components/MenuItemSkeleton";
import AddItemGhost from '@/components/AddItemGhost'
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
import ProCrown from '@/components/ui/ProCrown'
import UpgradeDialog from '@/components/ui/UpgradeDialog'

interface CategorySectionProps {
  category: Category
  isDemo: boolean
  isAdmin?: boolean
  editingCategoryId: string | null
  setEditingCategoryId: (id: string | null) => void
  originalCategory: Category | null
  setOriginalCategory: (cat: Category | null) => void
  plan: string
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
  dragHandleProps?: {
    setActivatorNodeRef: (el: HTMLElement | null) => void
    listeners: any
    isDragging: boolean
  }
}

export default function CategorySection({
  category,
  isDemo,
  isAdmin = true,
  plan = 'essentiel',
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
  dragHandleProps,
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

  // Check if plan allows category duplication (Pro/Premium only)
  const isProOrPremium = plan === 'pro' || plan === 'premium'

  // Use useMenuItems hook for item actions
  const {
    saveItem,
    deleteMenuItem,
    handleItemChange,
    savingItemId,
    addMenuItem
  } = useMenuItems(categories, setCategories, isDemo, (feature: string) => {
    setUpgradeFeature(feature)
    setUpgradeDialogOpen(true)
  })

  // Local state for editing item
  const [editingItem, setEditingItem] = useState<string | null>(null)
  
  // State for category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

  // State for upgrade dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState('')
  const [upgradeDescription, setUpgradeDescription] = useState('')

  // Handler for when upgrade is needed (item limit reached)
  const handleUpgradeNeeded = () => {
    const maxItems = subscription?.planConfig?.features.maxItems
    setUpgradeFeature("Limite d'articles atteinte")
    setUpgradeDescription(`Vous avez atteint la limite de ${maxItems} articles pour le plan ${subscription?.planConfig?.name}. Passez à un plan supérieur pour ajouter plus d'éléments.`)
    setUpgradeDialogOpen(true)
  }

  // Add item handler using the hook, with demo mode protection
  const handleAddMenuItem = async (catId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).");
      return;
    }

    // Check subscription limits before creating
    if (subscription && !subscription.canCreateMenuItem) {
      const maxItems = subscription.planConfig?.features.maxItems
      setUpgradeFeature("Limite d'articles atteinte")
      setUpgradeDescription(`Vous avez atteint la limite de ${maxItems} articles pour le plan ${subscription.planConfig?.name}. Passez à un plan supérieur pour ajouter plus d'éléments.`)
      setUpgradeDialogOpen(true)
      return;
    }

    // Set global loading state to disable all add buttons
    setIsAddingItemGlobally?.(true)

    // Find the target category and calculate the correct display_order
    const targetCategory = categories.find(cat => cat.id === catId);
    if (!targetCategory) {
      setIsAddingItemGlobally?.(false);
      return;
    }

    // Get the highest display_order from existing real items (not temp ones)
    const realItems = targetCategory.menu_items.filter((item: MenuItem) => !item.id.startsWith('temp-'));
    const maxDisplayOrder = realItems.length > 0 
      ? Math.max(...realItems.map((item: MenuItem) => typeof item.display_order === 'number' ? item.display_order : 0))
      : -1;
    const newDisplayOrder = maxDisplayOrder + 1;

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
                display_order: newDisplayOrder,
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

    // Create a working copy of menu items with proper display_order
    const workingItems = category.menu_items.map((item, index) => ({
      ...item,
      display_order: typeof item.display_order === 'number' ? item.display_order : index
    }))

    // Sort by display_order to get current visual order
    const sortedItems = workingItems.sort((a, b) => a.display_order - b.display_order)

    // Perform the move
    const [moved] = sortedItems.splice(oldIndex, 1)
    sortedItems.splice(newIndex, 0, moved)
    
    // Reassign display_order sequentially
    sortedItems.forEach((item, idx) => {
      item.display_order = idx
    })
    
    // Update categories state
    const newCategories = categories.map(c =>
      c.id === category.id ? { ...c, menu_items: sortedItems } : c
    )
    setCategories(newCategories)

    // Persist order to API if not demo
    if (!isDemo) {
      sortedItems.forEach((item, idx) => {
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

  // Duplicate category handler
  const handleDuplicateCategory = async (catId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return;
    }

    // Check plan restrictions first
    if (!isProOrPremium) {
      setUpgradeFeature("Dupliquer des catégories")
      setUpgradeDescription("La duplication de catégories est une fonctionnalité premium qui vous permet de gagner du temps en copiant instantanément une catégorie et tous ses articles.")
      setUpgradeDialogOpen(true)
      return
    }
    
    setIsAddingItemGlobally?.(true);
    // Find the index and display_order of the category to duplicate
    const cats = [...categories];
    const originalIdx = cats.findIndex(c => c.id === catId);
    if (originalIdx === -1) {
      setIsAddingItemGlobally?.(false);
      return;
    }
    const originalCat = cats[originalIdx];
    const newDisplayOrder = (typeof originalCat.display_order === 'number' ? originalCat.display_order : originalIdx) + 1;

    // Add a temporary skeleton category to UI at the right position
    const tempCatId = `temp-dup-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const tempCat = {
      ...category,
      id: tempCatId,
      name: category.name + ' (copie)',
      isLoading: true,
      display_order: newDisplayOrder,
      menu_items: (category.menu_items || []).map((item, idx) => ({
        ...item,
        id: `temp-dup-item-${Date.now()}-${idx}`,
        isLoading: true
      }))
    };

    // Increment display_order of all categories after the original
    const updatedCats = cats.map((c, idx) => {
      if (idx > originalIdx) {
        return { ...c, display_order: (typeof c.display_order === 'number' ? c.display_order : idx) + 1 };
      }
      return c;
    });
    // Insert tempCat after the original
    updatedCats.splice(originalIdx + 1, 0, tempCat);
    setCategories(updatedCats);

    try {
      const payload = { categoryId: catId, display_order: newDisplayOrder };
      const res = await fetch('/api/admin/menu-category/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.category) {
        // If the API returns duplicated items, use them; otherwise, fallback to empty array
        const duplicatedItems = data.menu_items || [];
        setCategories((cats) => {
          // Remove tempCat and update display_order of all categories that were shifted by the database
          return cats
            .filter((c) => c.id !== tempCatId)
            .map((cat) => {
              // If this category's display_order is >= the new category's display_order (and it's not the original), increment it
              if (typeof cat.display_order === 'number' && 
                  typeof data.category.display_order === 'number' && 
                  cat.display_order >= data.category.display_order && 
                  cat.id !== catId) {
                return { ...cat, display_order: cat.display_order + 1 };
              }
              return cat;
            })
            .concat({ ...data.category, menu_items: duplicatedItems })
            .sort((a, b) => {
              const orderA = typeof a.display_order === 'number' ? a.display_order : 0;
              const orderB = typeof b.display_order === 'number' ? b.display_order : 0;
              return orderA - orderB;
            });
        });
        toast.success('Catégorie dupliquée');
      } else {
        setCategories((cats) => cats.filter((c) => c.id !== tempCatId));
        toast.error(data.error || 'Erreur lors de la duplication');
      }
    } catch (e) {
      setCategories((cats) => cats.filter((c) => c.id !== tempCatId));
      toast.error('Erreur lors de la duplication');
    } finally {
      setIsAddingItemGlobally?.(false);
    }
  }

  // Duplicate item handler
  const handleDuplicateItem = async (itemId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return;
    }

    // Check plan restrictions first
    if (!isProOrPremium) {
      setUpgradeFeature("Dupliquer des articles")
      setUpgradeDescription("La duplication d'articles est une fonctionnalité premium qui vous permet de gagner du temps en copiant instantanément un article avec tous ses paramètres.")
      setUpgradeDialogOpen(true)
      return
    }

    // Check subscription limits before creating
    if (subscription && !subscription.canCreateMenuItem) {
      const maxItems = subscription.planConfig?.features.maxItems
      setUpgradeFeature("Limite d'articles atteinte")
      setUpgradeDescription(`Vous avez atteint la limite de ${maxItems} articles pour le plan ${subscription.planConfig?.name}. Passez à un plan supérieur pour ajouter plus d'éléments.`)
      setUpgradeDialogOpen(true)
      return;
    }
    
    setIsAddingItemGlobally?.(true);

    // Find the item to duplicate in all categories
    let itemToDuplicate: MenuItem | null = null;
    let targetCategoryId: string | null = null;
    
    for (const cat of categories) {
      const foundItem = cat.menu_items?.find((item: MenuItem) => item.id === itemId);
      if (foundItem) {
        itemToDuplicate = foundItem;
        targetCategoryId = cat.id;
        break;
      }
    }

    if (!itemToDuplicate || !targetCategoryId) {
      setIsAddingItemGlobally?.(false);
      return;
    }

    // Calculate the new display_order (after the original item)
    const newDisplayOrder = (typeof itemToDuplicate.display_order === 'number' ? itemToDuplicate.display_order : 0) + 1;

    // Add a temporary item to UI at the right position
    const tempItemId = `temp-dup-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const targetCategory = categories.find(cat => cat.id === targetCategoryId);
    const tempItem = {
      ...itemToDuplicate,
      id: tempItemId,
      name: itemToDuplicate.name + ' (copie)',
      isLoading: true,
      display_order: newDisplayOrder,
      display_style: targetCategory?.display_style || "card",
    };

    // Update categories state with temp item and adjust display_order of subsequent items
    setCategories((cats) => 
      cats.map((cat) => {
        if (cat.id === targetCategoryId) {
          const items = cat.menu_items || [];
          // Find index of original item
          const originalIdx = items.findIndex((item: MenuItem) => item.id === itemId);
          if (originalIdx === -1) return cat;
          
          // Update display_order for items after the original
          const updatedItems = items.map((item: MenuItem, idx) => {
            if (idx > originalIdx) {
              return { ...item, display_order: (typeof item.display_order === 'number' ? item.display_order : idx) + 1 };
            }
            return item;
          });

          // Insert temp item after original
          updatedItems.splice(originalIdx + 1, 0, tempItem);
          
          return { ...cat, menu_items: updatedItems };
        }
        return cat;
      })
    );

    try {
      const payload = { itemId, display_order: newDisplayOrder };
      const res = await fetch('/api/admin/menu-item/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.item) {
        // Replace temp item with real duplicated item and update display_order of subsequent items
        setCategories((cats) => 
          cats.map((cat) => {
            if (cat.id === targetCategoryId) {
              const items = cat.menu_items || [];
              const updatedItems = items.map((item: MenuItem) => {
                if (item.id === tempItemId) {
                  // Replace temp item with real duplicated item
                  return data.item;
                } else if (typeof item.display_order === 'number' && typeof data.item.display_order === 'number' && 
                          item.display_order >= data.item.display_order && item.id !== itemId) {
                  // Increment display_order for items that were shifted by the database
                  return { ...item, display_order: item.display_order + 1 };
                }
                return item;
              });
              return { ...cat, menu_items: updatedItems };
            }
            return cat;
          })
        );
        toast.success('Article dupliqué');
      } else {
        // Remove temp item on error
        setCategories((cats) => 
          cats.map((cat) => {
            if (cat.id === targetCategoryId) {
              const items = cat.menu_items || [];
              const filteredItems = items.filter((item: MenuItem) => item.id !== tempItemId);
              return { ...cat, menu_items: filteredItems };
            }
            return cat;
          })
        );
        toast.error(data.error || 'Erreur lors de la duplication');
      }
    } catch (e) {
      // Remove temp item on error
      setCategories((cats) => 
        cats.map((cat) => {
          if (cat.id === targetCategoryId) {
            const items = cat.menu_items || [];
            const filteredItems = items.filter((item: MenuItem) => item.id !== tempItemId);
            return { ...cat, menu_items: filteredItems };
          }
          return cat;
        })
      );
      toast.error('Erreur lors de la duplication');
    } finally {
      setIsAddingItemGlobally?.(false);
    }
  }

  // Simplified category header render function
  const renderCategoryHeader = () => {
    const categoryUnavailable = category.is_available === false;
    const categoryDietary = getCategoryDietaryAttributes(category);

    return (
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2"
      >
        {/* Top row: drag handle, name, badges */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag handle on the left with button size */}
          {isAdmin && dragHandleProps && (
            <div
              ref={dragHandleProps.setActivatorNodeRef}
              {...dragHandleProps.listeners}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded touch-manipulation focus:outline-none"
              title="Déplacer la catégorie"
              tabIndex={0}
              role="button"
              aria-label="Déplacer la catégorie"
              style={{
                userSelect: 'none',
                touchAction: 'none',
                cursor: 'grab',
              }}
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <h2
            className={`text-2xl font-bold ${isAdmin && 'flex-1'} min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${
              categoryUnavailable ? 'text-gray-400 line-through' : ''
            }`}
            title={category.name}
          >
            {category.name}
          </h2>
          {/* Badges next to name, always inline */}
          <div className="flex gap-1 ml-1">
            {categoryDietary.vegan && (
              <DietaryBadge type="vegan" variant="active" showText={false} />
            )}
            {categoryDietary.alcoholFree && (
              <DietaryBadge type="alcohol-free" variant="active" showText={false} />
            )}
          </div>
        </div>
        {/* Action buttons: always in a row, but on small screens, below the name */}
        { isAdmin && (
          <div className="flex items-center gap-2 sm:mt-0 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setOriginalCategory({ ...category });
                    setIsCategoryDialogOpen(true);
                  }}
                  title="Modifier la catégorie"
                  className="cursor-pointer"
                >
                  <Pencil className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier la catégorie</p>
              </TooltipContent>
            </Tooltip>

            <div className="tutorial-dup-category">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={!isProOrPremium ? () => {
                      setUpgradeFeature("Dupliquer des catégories")
                      setUpgradeDescription("La duplication de catégories est une fonctionnalité premium qui vous permet de gagner du temps en copiant instantanément une catégorie et tous ses articles.")
                      setUpgradeDialogOpen(true)
                    } : () => handleDuplicateCategory(category.id)}
                    variant="ghost"
                    size="icon"
                    title="Dupliquer la catégorie"
                    className={`cursor-pointer relative ${!isProOrPremium ? 'opacity-80 hover:opacity-100' : ''}`}
                    disabled={category.id.startsWith('temp-') || isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))}
                  >
                    <div className="w-5 h-5 flex items-center justify-center relative">
                      {(isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))) ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CopyPlus className="w-5 h-5" />
                      )}
                      {(!isProOrPremium && !isAddingItemGlobally && !Boolean(loadingAction?.includes('adding-category'))) && (
                        <span
                          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow z-10"
                          style={{ transform: 'rotate(18deg)' }}
                        >
                          <ProCrown className="w-3 h-3 !w-3 !h-3 text-yellow-500 drop-shadow" />
                        </span>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {(isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))) ? (
                    <p>Ajout en cours...</p>
                  ) : !isProOrPremium ? (
                    <div className="text-center">
                      <p className="mb-1">Fonctionnalité premium</p>
                      <p className="text-xs">Cliquer pour découvrir les plans</p>
                    </div>
                  ) : (
                    <p>Dupliquer la catégorie</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>

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
          </div>
        )}
      </div>
    );
  }

  if (category.isLoading) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-6">
        <CategorySkeleton />
        <div className={
          category.display_style === "card"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full mt-4"
            : category.display_style === "compact"
            ? "grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-full mt-4"
            : "max-w-full mt-4"
        }>
          {(category.menu_items || []).map((item, idx) =>
            <MenuItemSkeleton key={item.id || idx} displayStyle={category.display_style as "card" | "list" | "compact" | "table"} />
          )}
        </div>
      </section>
    )
  }

  // Filter out unavailable items if not admin
  const visibleMenuItems = isAdmin
    ? category.menu_items
    : category.menu_items.filter(item => item.is_available !== false);

  // If not admin, disable sorting and drag-and-drop
  if (!isAdmin) {
    return (
      <section className="category-section max-w-4xl mx-auto px-4 py-6">
        {/* Category Header */}
        <div className="mb-4">
          {renderCategoryHeader()}
        </div>
        <div
          className={
            category.display_style === "card"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full"
              : category.display_style === "compact"
              ? "grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-full"
              : "max-w-full"
          }
        >
          {visibleMenuItems
            .map((item, index) => ({
              ...item,
              display_order: typeof item.display_order === 'number' ? item.display_order : index
            }))
            .sort((a, b) => {
              const orderA = a.display_order
              const orderB = b.display_order
              return orderA - orderB
            })
            .map((item) => (
              item.isLoading ? (
                <MenuItemSkeleton key={item.id} displayStyle={item.display_style as "card" | "list" | "compact" | "table"} />
              ) : category.display_style === "list" ? (
                <MenuItemList
                  key={item.id}
                  item={item}
                  plan={plan}
                  category={category}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  handleItemChange={handleItemChange}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: getCategoryDietaryAttributes(category).vegan,
                    alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                />
              ) : category.display_style === "compact" ? (
                <MenuItemCompact
                  key={item.id}
                  item={item}
                  plan={plan}
                  category={category}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: getCategoryDietaryAttributes(category).vegan,
                    alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                />
              ) : category.display_style === "table" ? (
                <MenuItemSkeleton key={item.id} displayStyle="table" />
              ) : (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  plan={plan}
                  category={category}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  handleItemChange={handleItemChange}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: getCategoryDietaryAttributes(category).vegan,
                    alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                />
              )
            ))}
        </div>
      </section>
    );
  }

  // Default: admin mode (sorting enabled)
  return (
    <section className="category-section max-w-4xl mx-auto px-4 py-6">
      {/* Category Header */}
      <div className="mb-4">
        {renderCategoryHeader()}
      </div>

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
                  plan={plan}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  handleItemChange={handleItemChange}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                />
              );
            case "compact":
              return (
                <MenuItemCompact
                  item={item}
                  category={category}
                  plan={plan}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
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
                  plan={plan}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  handleItemChange={handleItemChange}
                  saveItem={handleSaveItem}
                  savingItemId={savingItemId}
                  loadingAction={loadingAction}
                  deleteMenuItem={handleDeleteMenuItem}
                  duplicateItem={handleDuplicateItem}
                  establishmentColor={establishmentColor}
                  isDemo={isDemo}
                  isAdmin={isAdmin}
                  basketEnabled={basketEnabled}
                  hideDietaryBadges={{
                    vegan: categoryDietary.vegan,
                    alcoholFree: categoryDietary.alcoholFree
                  }}
                  categoryIsAvailable={category.is_available !== false}
                  isGloballyLoading={isAddingItemGlobally}
                  canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                />
              );
          }
        }}
      >
        {/* Menu Items with Drag & Drop */}
        <div
          className={
            category.display_style === "card"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full"
              : category.display_style === "compact"
              ? "grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-full"
              : "max-w-full"
          }
        >
          {category.menu_items
            .map((item, index) => ({
              ...item,
              // Ensure display_order is set if it's null/undefined
              display_order: typeof item.display_order === 'number' ? item.display_order : index
            }))
            .sort((a, b) => {
              const orderA = a.display_order
              const orderB = b.display_order
              return orderA - orderB
            })
            .map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                disabled={editingItem === item.id} // Disable when editing
              >
                {item.isLoading ? (
                  <MenuItemSkeleton displayStyle={item.display_style as "card" | "list" | "compact" | "table"} />
                ) : category.display_style === "list" ? (
                  <MenuItemList
                    item={item}
                    category={category}
                    plan={plan}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    handleItemChange={handleItemChange}
                    saveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    loadingAction={loadingAction}
                    deleteMenuItem={handleDeleteMenuItem}
                    duplicateItem={handleDuplicateItem}
                    establishmentColor={establishmentColor}
                    isDemo={isDemo}
                    isAdmin={isAdmin}
                    basketEnabled={basketEnabled}
                    hideDietaryBadges={{
                      vegan: getCategoryDietaryAttributes(category).vegan,
                      alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                    }}
                    categoryIsAvailable={category.is_available !== false}
                    isGloballyLoading={isAddingItemGlobally}
                    canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                  />
                ) : category.display_style === "compact" ? (
                  <MenuItemCompact
                    item={item}
                    category={category}
                    plan={plan}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    saveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    loadingAction={loadingAction}
                    deleteMenuItem={handleDeleteMenuItem}
                    duplicateItem={handleDuplicateItem}
                    establishmentColor={establishmentColor}
                    isDemo={isDemo}
                    isAdmin={isAdmin}
                    basketEnabled={basketEnabled}
                    hideDietaryBadges={{
                      vegan: getCategoryDietaryAttributes(category).vegan,
                      alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                    }}
                    categoryIsAvailable={category.is_available !== false}
                    isGloballyLoading={isAddingItemGlobally}
                    canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                  />
                ) : category.display_style === "table" ? (
                  <MenuItemSkeleton displayStyle="table" />
                ) : (
                  <MenuItemCard
                    item={item}
                    category={category}
                    plan={plan}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    handleItemChange={handleItemChange}
                    saveItem={handleSaveItem}
                    savingItemId={savingItemId}
                    loadingAction={loadingAction}
                    deleteMenuItem={handleDeleteMenuItem}
                    duplicateItem={handleDuplicateItem}
                    establishmentColor={establishmentColor}
                    isDemo={isDemo}
                    isAdmin={isAdmin}
                    basketEnabled={basketEnabled}
                    hideDietaryBadges={{
                      vegan: getCategoryDietaryAttributes(category).vegan,
                      alcoholFree: getCategoryDietaryAttributes(category).alcoholFree
                    }}
                    categoryIsAvailable={category.is_available !== false}
                    isGloballyLoading={isAddingItemGlobally}
                    canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                  />
                )}
              </SortableItem>
            ))}

          {/* Add Item Ghost - only show in admin mode */}
          {isAdmin && (
            <div className="tutorial-add-item">
              <AddItemGhost
                displayStyle={category.display_style || "card"}
                onAddItem={() => handleAddMenuItem(category.id)}
                loading={isAddingItemGlobally || Boolean(loadingAction?.includes('adding-category'))}
                canCreateMenuItem={subscription?.canCreateMenuItem ?? true}
                limitInfo={subscription?.canCreateMenuItem === false && subscription?.planConfig ? {
                  current: subscription.planConfig.features.currentItemCount || 0,
                  max: subscription.planConfig.features.maxItems || 0,
                  planName: subscription.planConfig.name || 'Essentiel'
                } : undefined}
                establishmentColor={establishmentColor}
                onUpgradeNeeded={handleUpgradeNeeded}
              />
            </div>
          )}
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
            plan={plan}
            savingCategoryId={savingCategoryId}
            loadingAction={loadingAction}
            onSubmit={handleCategorySubmit}
            onDelete={handleCategoryDelete}
            onCancel={handleCategoryCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        feature={upgradeFeature}
        description={upgradeDescription}
      />
    </section>
  )
}
