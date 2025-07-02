'use client'

import { useState } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog"
import { Plus } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { DndKitWrapper } from '@/components/DndKitWrapper'
import { SortableCategory } from '@/components/SortableCategory'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import CategorySection from '@/components/CategorySection'
import { useCategories } from '@/components/hooks/useCategories'
import { useMenuItems } from '@/components/hooks/useMenuItems'
import ParameterSheet from '@/components/ParameterSheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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

  const {
    categories,
    setCategories,
    addCategory,
    deleteCategory,
    saveCategory,
    savingCategoryId,
    loadingAction,
    editingCategoryId,
    setEditingCategoryId,
    originalCategory,
    setOriginalCategory
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

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'category' | 'item'
    catId: string
    itemId?: string
  } | null>(null)

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    
    if (confirmDelete.type === 'item' && confirmDelete.itemId) {
      deleteMenuItem(confirmDelete.catId, confirmDelete.itemId)
    } else if (confirmDelete.type === 'category') {
      deleteCategory(confirmDelete.catId)
    }

    setConfirmDelete(null)
  }

  const handleLogoUpload = async (url: string) => {
    if (isDemo) {
      setDemoLogoUrl(url)
      toast.info("Aperçu du logo modifié (démo, non sauvegardé)")
      return
    }

    const res = await fetch("/api/admin/update-logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: establishment.id, logo_url: url }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      toast.success("Logo mis à jour !")
      establishment.logo_url = url
    } else {
      toast.error(data.error || "Erreur lors de la mise à jour du logo")
    }
  }

  const handleCategoryDragEnd = (oldIndex: number, newIndex: number) => {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 relative flex flex-col">
      <div className="flex justify-end mb-4">
        <ParameterSheet establishment={establishment} isDemo={isDemo} />
      </div>

      <div className="mb-4 mt-7">
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
        <h1 className="text-3xl font-bold text-center mt-2">{establishment.name}</h1>
      </div>

      <div className="flex justify-center mt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={addCategory}
              variant="ghost"
              size="icon"
              title="Nouvelle catégorie"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600"
              disabled={loadingAction !== null}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ajouter une catégorie</p>
          </TooltipContent>
        </Tooltip>
      </div>

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
                  editingCategoryId={editingCategoryId}
                  setEditingCategoryId={setEditingCategoryId}
                  originalCategory={originalCategory}
                  setOriginalCategory={setOriginalCategory}
                  savingCategoryId={savingCategoryId}
                  loadingAction={loadingAction}
                  categories={categories}
                  setCategories={setCategories}
                  saveCategory={saveCategory}
                  addMenuItem={addMenuItem}
                  deleteMenuItem={deleteMenuItem}
                  saveItem={saveItem}
                  handleItemChange={handleItemChange}
                  savingItemId={savingItemId}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  setConfirmDelete={setConfirmDelete}
                  establishmentColor={establishment.primary_color ?? undefined}
                />
              </SortableCategory>
            ))}
        </div>
      </DndKitWrapper>

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === 'category' ? 'Supprimer la catégorie' : 'Supprimer l\'élément'}
        message={confirmDelete?.type === 'category'
          ? 'Supprimer cette catégorie ? Cette action est irréversible.'
          : 'Supprimer cet élément ? Cette action est irréversible.'}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
