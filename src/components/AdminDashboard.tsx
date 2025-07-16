'use client'

import { useState, useEffect } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase_types'
import { toast } from "sonner"
import ImageUpload from "@/components/ImageUpload"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableCategory } from '@/components/SortableCategory'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import CategorySection from '@/components/CategorySection'
import { useCategories } from '@/components/hooks/useCategories'
import { useMenuItems } from '@/components/hooks/useMenuItems'
import ParameterSheet from '@/components/ParameterSheet'
import { AddCategoryButton } from '@/components/AddCategoryButton'
import { useDashboardTutorial } from '@/hooks/useDashboardTutorial'
import { EstablishmentControls } from '@/components/EstablishmentControls'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

export default function AdminDashboard({ establishment }: AdminDashboardProps) {
  const isDemo = establishment.slug === 'demo'
  const [demoLogoUrl, setDemoLogoUrl] = useState<string | undefined>(
    isDemo ? (establishment.logo_url ?? undefined) : undefined
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const { startTutorial, tutorialCompleted } = useDashboardTutorial()

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
  } = useCategories(establishment, isDemo)

  const {
    addMenuItem,
    deleteMenuItem,
    saveItem,
    handleItemChange,
    savingItemId,
    editingItem,
    setEditingItem
  } = useMenuItems(categories, setCategories, isDemo)

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

    const display_order = position === 'top' ? 0 : categories.length;
    if (position === 'top') {
      setCategories(cats => cats.map(cat => ({ ...cat, display_order: (cat.display_order ?? 0) + 1 })));
    }

    const tempCat = {
      id: `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: "Nouvelle catégorie",
      display_style: "card",
      order: display_order,
      created_at: new Date().toISOString(),
      display_order,
      establishment_id: establishment.id,
      menu_items: [],
      isLoading: true,
    };

    setCategories(cats => {
      const arr = [...cats];
      arr.splice(display_order, 0, tempCat);
      return arr;
    });

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
        toast.success("Catégorie créée");
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      setCategories(cats => cats.filter(cat => cat.id !== tempCat.id));
      toast.error("Erreur lors de la création de la catégorie");
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

    const sorted = [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    const [moved] = sorted.splice(oldIndex, 1)
    sorted.splice(newIndex, 0, moved)
    sorted.forEach((cat, idx) => (cat.display_order = idx))

    setCategories(sorted)

    // Persist order to API
    if (!isDemo) {
      sorted.forEach((cat, idx) => {
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
        <div className="tutorial-parameters-button">
          <ParameterSheet
            establishment={{
              id: establishment.id,
              slug: establishment.slug,
              primary_color: establishment.primary_color ?? undefined,
              secondary_color: establishment.secondary_color ?? undefined,
              plan: establishment.plan,
              logo_url: establishment.logo_url ?? undefined,
            }}
            isDemo={isDemo}
            onTutorialStart={startTutorial}
          />
        </div>
      </div>

      <div className="tutorial-welcome mb-4 mt-7">
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
        <h1 
          className="text-3xl font-bold text-center mt-2"
          style={{ color: establishment.secondary_color || undefined }}
        >
          {establishment.name}
        </h1>
      </div>

      {/* Show only one button when there are no categories */}
      {categories.length === 0 ? (
        <AddCategoryButton
          onClick={() => addCategory('top')}
          disabled={loadingAction !== null}
          loading={loadingAction?.startsWith('adding-category')}
          className="flex justify-center mt-4"
        />
      ) : (
        <AddCategoryButton
          onClick={() => addCategory('top')}
          disabled={loadingAction !== null}
          loading={loadingAction?.startsWith('adding-category')}
          className="flex justify-center mt-4"
        />
      )}

      <DndKitWrapper
        items={categories}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleCategoryDragEnd}
      >
        <div className="space-y-8">
          {[...categories]
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map(cat => (
              <SortableCategory key={cat.id} id={cat.id}>
                <CategorySection
                  category={cat}
                  isDemo={isDemo}
                  isAdmin={true}
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
                  textColor={establishment.secondary_color ?? undefined}
                  deleteCategory={handleDeleteCategory}
                />
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
          className="flex justify-center mt-8"
        />
      )}
      
      {/* Edit Contact Information Button - Always visible */}
      <div className="flex justify-center mt-6 mb-6">
        {isDemo ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={true}
              >
                <Settings className="w-4 h-4" />
                Modifier les informations de contact
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modification désactivée (mode démo)</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <EstablishmentControls 
            establishmentId={establishment.id}
            slug={establishment.slug}
            primaryColor={establishment.primary_color ?? undefined}
          />
        )}
      </div>
    </div>
  )
}
