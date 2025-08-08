'use client'

import { useState } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase_types'
import { toast } from "sonner"
import ImageUpload from "@/components/ImageUpload"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableCategory } from '@/components/SortableCategory'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { verticalListSortingStrategy } from '@dnd-kit/sortable'
import CategorySection from '@/components/CategorySection'
import { useCategories } from '@/components/hooks/useCategories'
import ParameterSheet from '@/components/ParameterSheet'
import { AddCategoryButton } from '@/components/AddCategoryButton'
import { useDashboardTutorial } from '@/hooks/useDashboardTutorial'
import { EstablishmentControls } from '@/components/EstablishmentControls'
import { useSubscription } from '@/hooks/useSubscription'
import BadgeLegend from '@/components/BadgeLegend'
import UpgradeDialog from '@/components/ui/UpgradeDialog'

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

export default function AdminDashboard({ establishment }: AdminDashboardProps) {
  const isDemo = establishment.slug === 'demo'
  const [demoLogoUrl, setDemoLogoUrl] = useState<string | undefined>(
    isDemo ? (establishment.logo_url ?? undefined) : undefined
  )
  const [isAddingItemGlobally, setIsAddingItemGlobally] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeFeature, setUpgradeFeature] = useState('')
  const { startTutorial, tutorialCompleted } = useDashboardTutorial()
  
  const handleUpgradeNeeded = (feature: string) => {
    setUpgradeFeature(feature)
    setUpgradeDialogOpen(true)
  }
  
  const {
    categories,
    setCategories,
    deleteCategory,
    saveCategory,
    savingCategoryId,
    loadingAction,
    editingCategoryId,
    setEditingCategoryId,
    originalCategory,
    setOriginalCategory,
    setLoadingAction
  } = useCategories(establishment, isDemo, handleUpgradeNeeded)
  
  // Initialize subscription hook with current categories for real-time count updates
  const subscription = useSubscription(establishment, categories)

  const handleLogoUpload = async (url: string) => {
    if (isDemo) {
      setDemoLogoUrl(url)
      toast.info("Modification désactivée (mode démo).")
      return
    }

    const res = await fetch("/api/admin/update-logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: establishment.id, logo_url: url }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      establishment.logo_url = url
    } else {
      toast.error(data.error || "Erreur lors de la mise à jour du logo")
    }
  }

  // Add category at a specific position (top or bottom)
  const addCategory = async (position: 'top' | 'bottom') => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return;
    }

    // Set loading state to disable buttons
    setLoadingAction(`adding-category-${position}`)

    // Sort categories by display_order to get current order
    const sortedCategories = [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const display_order = position === 'top' ? 0 : sortedCategories.length;

    const tempCat = {
      id: `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: "Nouvelle catégorie",
      display_style: "card",
      order: display_order,
      created_at: new Date().toISOString(),
      display_order,
      establishment_id: establishment.id,
      is_available: true,
      menu_items: [],
      isLoading: true,
      alcohol_free: null,
      vegan: null,
    };

    // Update display_order for existing categories if inserting at top
    if (position === 'top') {
      setCategories(cats => {
        const updatedCats = cats.map(cat => ({ 
          ...cat, 
          display_order: (cat.display_order ?? 0) + 1 
        }));
        return [tempCat, ...updatedCats];
      });
    } else {
      setCategories(cats => [...cats, tempCat]);
    }

    try {
      const res = await fetch('/api/admin/menu-category/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempCat.name,
          display_style: tempCat.display_style,
          display_order: tempCat.display_order,
          establishment_id: tempCat.establishment_id,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.category) {
        setCategories(cats => cats.map(cat =>
          cat.id === tempCat.id ? { ...data.category, menu_items: [] } : cat
        ));
        
        // Update display_order for other categories in the database if inserting at top
        if (position === 'top') {
          const updatePromises = categories.map((cat, index) => 
            fetch('/api/admin/menu-category/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...cat, display_order: index + 1 }),
            })
          );
          await Promise.all(updatePromises);
        }
        
        toast.success("Catégorie créée");
      } else {
        // Handle specific API errors
        if (data?.code === 'SUBSCRIPTION_LIMIT_REACHED') {
          toast.error(data.error || "Limite d'abonnement atteinte")
          // Open upgrade dialog
          setUpgradeFeature('Ajouter plus de catégories')
          setUpgradeDialogOpen(true)
        } else {
          toast.error(data?.error || "Erreur lors de la création de la catégorie")
        }
        throw new Error('Failed to create category');
      }
    } catch (error) {
      setCategories(cats => cats.filter(cat => cat.id !== tempCat.id));
      // Don't show additional toast here as we already showed specific error above
    } finally {
      setLoadingAction(null);
    }
  }

  // Disable drag and drop in demo mode
  const handleCategoryDragEnd = (oldIndex: number, newIndex: number) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    if (oldIndex === newIndex) return

    // Get properly sorted categories first
    const sortedCategories = [...categories].sort((a, b) => {
      const orderA = typeof a.display_order === 'number' ? a.display_order : 999999
      const orderB = typeof b.display_order === 'number' ? b.display_order : 999999
      return orderA - orderB
    })

    // Move the category
    const [moved] = sortedCategories.splice(oldIndex, 1)
    sortedCategories.splice(newIndex, 0, moved)
    
    // Reassign display_order to all categories sequentially
    sortedCategories.forEach((cat, idx) => {
      cat.display_order = idx
    })

    setCategories(sortedCategories)

    // Persist order to API
    if (!isDemo) {
      sortedCategories.forEach((cat, idx) => {
        fetch('/api/admin/menu-category/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cat, display_order: idx }),
        })
      })
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    await deleteCategory(catId)
  }

  const handleSaveCategory = async (cat: any) => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    await saveCategory(cat)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 relative flex flex-col">
      <div className="flex justify-end mb-4">
        <ParameterSheet
          establishment={{
            id: establishment.id,
            slug: establishment.slug,
            primary_color: establishment.primary_color ?? undefined,
            plan: establishment.plan,
            logo_url: establishment.logo_url ?? undefined,
          }}
          isDemo={isDemo}
          subscription={subscription}
          onTutorialStart={startTutorial}
        />
      </div>

      <div className="mt-6">
        <ImageUpload
          establishmentId={establishment.id}
          currentImageUrl={establishment.logo_url ?? undefined}
          color={establishment.primary_color ?? undefined}
          slug={establishment.slug}
          onImageUploaded={handleLogoUpload}
          onDeleteLogo={() => {
            establishment.logo_url = null
          }}
          isDemo={isDemo}
        />
      </div>

      <h1 className="text-3xl font-bold text-center mt-2 mb-4">{establishment.name}</h1>

      <div className="tutorial-category-section">
        {/* Show only one button when there are no categories */}
        {categories.length === 0 ? (
          <AddCategoryButton
            onClick={() => addCategory('top')}
            disabled={loadingAction !== null}
            loading={loadingAction?.startsWith('adding-category')}
            className="tutorial-add-category flex justify-center mt-4 mb-4"
            subscription={subscription}
            isAddingItemGlobally={isAddingItemGlobally}
          />
        ) : (
          <AddCategoryButton
            onClick={() => addCategory('top')}
            disabled={loadingAction !== null}
            loading={loadingAction?.startsWith('adding-category')}
            className="tutorial-add-category flex justify-center mt-4 mb-4"
            subscription={subscription}
            isAddingItemGlobally={isAddingItemGlobally}
          />
        )}

        <DndKitWrapper
          id="categories-dnd"
          items={categories}
          modifiers={[restrictToParentElement]}
          onDragEnd={handleCategoryDragEnd}
          strategy={verticalListSortingStrategy}
          renderOverlay={(activeId) => {
            const category = categories.find(cat => cat.id === activeId);
            if (!category) return null;

            // Provide dummy drag handle props for overlay (since overlay is not interactive)
            const setActivatorNodeRef = () => {};
            const listeners = {};
            const isDragging = true;

            // Create a consistent drag overlay for categories with fixed size
            return (
              <CategorySection
                category={category}
                isDemo={isDemo}
                isAdmin={true}
                plan={establishment.plan || 'essentiel'}
                editingCategoryId={editingCategoryId}
                setEditingCategoryId={setEditingCategoryId}
                originalCategory={originalCategory}
                setOriginalCategory={setOriginalCategory}
                savingCategoryId={savingCategoryId}
                loadingAction={loadingAction}
                categories={categories}
                setCategories={setCategories}
                saveCategory={handleSaveCategory}
                establishmentColor={establishment.primary_color ?? '#3b82f6'}
                deleteCategory={handleDeleteCategory}
                subscription={subscription}
                isAddingItemGlobally={isAddingItemGlobally}
                setIsAddingItemGlobally={setIsAddingItemGlobally}
                basketEnabled={establishment.basket_enabled ?? true}
                isFirstCategory={false}
                // Pass drag handle props to CategorySection
                dragHandleProps={{
                  setActivatorNodeRef,
                  listeners,
                  isDragging
                }}
              />
            );
          }}
        >
          <div className="space-y-8">
            {[...categories]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((cat, index) => (
                <SortableCategory key={cat.id} id={cat.id}>
                  {(setActivatorNodeRef, listeners, isDragging) => (
                    <CategorySection
                      category={cat}
                      isDemo={isDemo}
                      isAdmin={true}
                      plan={establishment.plan || 'essentiel'}
                      editingCategoryId={editingCategoryId}
                      setEditingCategoryId={setEditingCategoryId}
                      originalCategory={originalCategory}
                      setOriginalCategory={setOriginalCategory}
                      savingCategoryId={savingCategoryId}
                      loadingAction={loadingAction}
                      categories={categories}
                      setCategories={setCategories}
                      saveCategory={handleSaveCategory}
                      establishmentColor={establishment.primary_color ?? undefined}
                      deleteCategory={handleDeleteCategory}
                      subscription={subscription}
                      isAddingItemGlobally={isAddingItemGlobally}
                      setIsAddingItemGlobally={setIsAddingItemGlobally}
                      basketEnabled={establishment.basket_enabled ?? true}
                      isFirstCategory={index === 0}
                      // Pass drag handle props to CategorySection
                      dragHandleProps={{
                        setActivatorNodeRef,
                        listeners,
                        isDragging
                      }}
                    />
                  )}
                </SortableCategory>
              ))}
          </div>
        </DndKitWrapper>
        
        {/* Show bottom button only when there are categories */}
        {categories.length > 0 && (
          <AddCategoryButton
          onClick={() => addCategory('bottom')}
          disabled={loadingAction !== null}
          loading={loadingAction?.startsWith('adding-category')}
          className="flex justify-center mb-8"
          subscription={subscription}
          isAddingItemGlobally={isAddingItemGlobally}
          />
        )}
      </div>
      
      {/* Badge Legend */}
      <BadgeLegend categories={categories} />
      
      {/* Edit Contact Information Button - Always visible */}
      <div className="tutorial-establishment-info-form flex justify-center mt-2">
        <EstablishmentControls
          slug={establishment.slug}
          primaryColor={establishment.primary_color ?? undefined}
          isDemo={isDemo}
          openingHoursData={establishment.opening_hours}
        />
      </div>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        feature={upgradeFeature}
      />
    </div>
  )
}
