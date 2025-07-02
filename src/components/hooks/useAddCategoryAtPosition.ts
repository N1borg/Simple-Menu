import { useCallback } from 'react'
import { toast } from 'sonner'
import type { EstablishmentWithCategories } from '@/types/supabase'

export function useAddCategoryAtPosition({
  isDemo,
  establishment,
  categories,
  setCategories,
  setLoadingAction
}: {
  isDemo: boolean,
  establishment: EstablishmentWithCategories,
  categories: any[],
  setCategories: (cats: any[]) => void,
  setLoadingAction: (action: string | null) => void
}) {
  // Helper to add category with a specific display_order
  const addCategoryWithOrder = useCallback(async (display_order: number) => {
    if (isDemo) {
      const newCat = {
        id: `new-${Date.now()}`,
        name: "Nouvelle catégorie",
        display_style: "card",
        order: display_order,
        created_at: new Date().toISOString(),
        display_order,
        establishment_id: establishment.id,
        menu_items: [],
      }
      const arr = [...categories]
      arr.splice(display_order, 0, newCat)
      setCategories(arr)
      toast.info("Catégorie ajoutée (démo, non sauvegardé)")
      return
    }
    setLoadingAction('addCategory')
    const tempId = `temp-${Date.now()}`
    const tempCat = {
      id: tempId,
      name: "Nouvelle catégorie",
      display_style: "card",
      order: display_order,
      created_at: new Date().toISOString(),
      display_order,
      establishment_id: establishment.id,
      menu_items: [],
    }
    const arr = [...categories]
    arr.splice(display_order, 0, tempCat)
    setCategories(arr)
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
      })
      const data = await res.json()
      if (res.ok && data?.category) {
        setCategories(categories.map(cat =>
          cat.id === tempId ? { ...data.category, menu_items: [] } : cat
        ))
        toast.success("Catégorie créée")
      } else {
        throw new Error('Failed to create category')
      }
    } catch (error) {
      setCategories(categories.filter(cat => cat.id !== tempId))
      toast.error("Erreur lors de la création de la catégorie")
    } finally {
      setLoadingAction(null)
    }
  }, [isDemo, establishment, setCategories, setLoadingAction, categories])

  // Add category at a specific position (top or bottom)
  const addCategory = useCallback(async (position: 'top' | 'bottom') => {
    const display_order = position === 'top' ? 0 : categories.length
    if (position === 'top') {
      setCategories(categories.map(cat => ({ ...cat, display_order: (cat.display_order ?? 0) + 1 })))
    }
    await addCategoryWithOrder(display_order)
  }, [categories, setCategories, addCategoryWithOrder])

  return { addCategory }
}
