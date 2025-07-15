import { useState } from 'react'
import { toast } from "sonner"
import type { EstablishmentWithCategories } from '@/types/supabase_types'

export function useCategories(establishment: EstablishmentWithCategories, isDemo: boolean) {
  const [categories, setCategories] = useState(
    establishment.categories.map(cat => ({
      ...cat,
      menu_items: cat.menu_items.map(item => ({ ...item }))
    }))
  )
  
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [originalCategory, setOriginalCategory] = useState<any | null>(null)

  const addCategory = async () => {
    const getTempId = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `temp-${crypto.randomUUID()}`
        : `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    if (isDemo) {
      const newCat = {
        id: `new-${Date.now()}`,
        name: "Nouvelle catégorie",
        display_style: "card",
        order: categories.length,
        created_at: new Date().toISOString(),
        display_order: categories.length,
        establishment_id: establishment.id,
        menu_items: [],
      }
      setCategories([newCat, ...categories])
      toast.info("Modification désactivée (mode démo).")
      return
    }

    setLoadingAction('addCategory')
    const tempId = getTempId();
    const tempCat = {
      id: tempId,
      name: "Nouvelle catégorie",
      display_style: "card",
      order: categories.length,
      created_at: new Date().toISOString(),
      display_order: categories.length,
      establishment_id: establishment.id,
      menu_items: [],
      isLoading: true,
    }

    setCategories([tempCat, ...categories])
    
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
        setCategories(cats => cats.map(cat => 
          cat.id === tempId ? { ...data.category, menu_items: [] } : cat
        ))
        toast.success("Catégorie créée")
      } else {
        throw new Error('Failed to create category')
      }
    } catch (error) {
      setCategories(cats => cats.filter(cat => cat.id !== tempId))
      toast.error("Erreur lors de la création de la catégorie")
    } finally {
      setLoadingAction(null)
    }
  }

  const deleteCategory = async (catId: string) => {
    if (isDemo) {
      setCategories(cats => cats.filter(cat => cat.id !== catId))
      toast.info("Modification désactivée (mode démo).")
      return
    }

    const prevCategories = [...categories]
    setCategories(cats => cats.filter(cat => cat.id !== catId))
    
    try {
      const res = await fetch('/api/admin/menu-category/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: catId }),
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success("Catégorie supprimée")
      } else {
        throw new Error('Failed to delete category')
      }
    } catch (error) {
      setCategories(prevCategories)
      toast.error("Erreur lors de la suppression de la catégorie")
    }
  }

  const saveCategory = async (cat: any) => {
    if (isDemo) {
      setEditingCategoryId(null)
      toast.info("Modification désactivée (mode démo).")
      return
    }

    setSavingCategoryId(cat.id)
    const prevCategories = JSON.parse(JSON.stringify(categories))
    setEditingCategoryId(null)
    
    try {
      const res = await fetch('/api/admin/menu-category/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
          display_style: cat.display_style,
          display_order: cat.display_order,
        }),
      })
      
      const data = await res.json()
      
      if (res.ok && data?.success) {
        toast.success("Catégorie sauvegardée")
      } else {
        throw new Error('Failed to save category')
      }
    } catch (error) {
      setCategories(prevCategories)
      toast.error("Erreur lors de la sauvegarde. Modifications annulées.")
    } finally {
      setSavingCategoryId(null)
    }
  }

  return {
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
    setOriginalCategory,
    isDemo,
    setSavingCategoryId,
    setLoadingAction,
    establishment,
    }
}
