import { useState } from 'react'
import { toast } from 'sonner'
import type { Category, MenuItem } from '@/types/supabase_types'

export function useMenuItems(
  categories: Category[],
  setCategories: (cats: Category[]) => void,
  isDemo: boolean
) {
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  // Add a new menu item (API call if not demo)
  const addMenuItem = async (catId: string) => {
    const getTempId = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `temp-${crypto.randomUUID()}`
        : `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    if (isDemo) {
      const newCategories = categories.map((cat: Category) =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: [
                ...cat.menu_items,
                {
                  id: `new-${Date.now()}`,
                  name: 'Nouvel élément',
                  description: '',
                  price_one: 0,
                  price_two: null,
                  price_three: null,
                  price_reduction: null,
                  is_available: true,
                  display_order: cat.menu_items.length,
                  category_id: catId,
                  created_at: new Date().toISOString(),
                  display_style: null,
                  image_url: null,
                  vegan: false,
                  alcohol_free: false,
                },
              ],
            }
          : cat
      )
      setCategories(newCategories)
      return
    }
    // Non-demo: call API to create item immediately
    const res = await fetch('/api/admin/menu-item/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nouvel élément',
        description: '',
        price_one: 0,
        is_available: true,
        display_order: categories.find((cat: Category) => cat.id === catId)?.menu_items.length ?? 0,
        category_id: catId,
        created_at: new Date().toISOString(),
        display_style: null,
        image_url: null,
        order: null,
      }),
    })
    const data = await res.json()
    // Ensure toast is only called once per operation
    if (!res.ok || !data || !data.item) {
      if (data?.code === 'SUBSCRIPTION_LIMIT_REACHED') {
        toast.error(data.error || "Limite d'abonnement atteinte")
        // Open upgrade dialog
        setTimeout(() => {
          window.open(
            'mailto:contact.simplemenu@gmail.com?subject=Upgrade%20Plan&body=Je%20souhaite%20passer%20à%20un%20plan%20supérieur%20pour%20ajouter%20plus%20d\'éléments%20de%20menu.',
            '_blank'
          )
        }, 1000)
      } else {
        toast.error(data?.error || "Erreur lors de la création de l'élément")
      }
      throw new Error('Failed to create menu item')
    }
    const newCategories = categories.map((cat: Category) =>
      cat.id === catId
        ? { ...cat, menu_items: [...cat.menu_items, data.item] }
        : cat
    )
    setCategories(newCategories)
    setEditingItem(data.item.id)
    toast.success("Élément créé !")
  }

  // Delete a menu item (API call if not demo)
  const deleteMenuItem = async (catId: string, itemId: string) => {
    if (isDemo) {
      const newCategories = categories.map((cat: Category) =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: cat.menu_items.filter((item: MenuItem) => item.id !== itemId),
            }
          : cat
      )
      setCategories(newCategories)
      return
    }
    // Store original state for potential revert
    const originalCategories = categories
    const removedItem = categories.find((cat: Category) => cat.id === catId)?.menu_items.find((item: MenuItem) => item.id === itemId)
    
    // Optimistic update - remove item immediately
    const newCategories = categories.map((cat: Category) =>
      cat.id === catId
        ? {
            ...cat,
            menu_items: cat.menu_items.filter((item: MenuItem) => item.id !== itemId),
          }
        : cat
    )
    setCategories(newCategories)
    
    try {
      const res = await fetch('/api/admin/menu-item/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        // Revert to original state on error
        setCategories(originalCategories)
        toast.error("Erreur lors de la suppression de l'élément")
        return
      }
      toast.success("Élément supprimé !")
    } catch (error) {
      // Revert to original state on network error
      setCategories(originalCategories)
      toast.error("Erreur lors de la suppression de l'élément")
    }
  }

  // Save or create a menu item
  const saveItem = async (item: any) => {
    setSavingItemId(item.id)
    const cat = categories.find((c: Category) => c.id === item.category_id)
    const originalItem = cat?.menu_items.find((i: any) => i.id === item.id)
    
    if (isDemo) {
      setEditingItem(null)
      setSavingItemId(null)
      return
    }
    
    // If it's a temp item, call create API
    if (item.id.startsWith('temp-')) {
      try {
        const res = await fetch('/api/admin/menu-item/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, id: undefined }),
        })
        const data = await res.json()
        setSavingItemId(null)
        setEditingItem(null)
        
        if (res.ok && data && data.item) {
          const newCategories = categories.map((cat: Category) =>
            cat.id === item.category_id
              ? {
                  ...cat,
                  menu_items: cat.menu_items.map((i: MenuItem) =>
                    i.id === item.id ? data.item : i
                  ),
                }
              : cat
          )
          setCategories(newCategories)
          toast.success("Élément créé !")
        } else {
          toast.error(data?.error || "Erreur lors de la création de l'élément")
          throw new Error('Failed to create item')
        }
      } catch (error) {
        setSavingItemId(null)
        setEditingItem(null)
        toast.error("Erreur lors de la création de l'élément")
        throw error
      }
      return
    }
    
    // Only call update if something changed
    if (
      originalItem &&
      item.name === originalItem.name &&
      item.description === originalItem.description &&
      item.price_one === originalItem.price_one &&
      item.display_style === originalItem.display_style &&
      item.display_order === originalItem.display_order &&
      item.is_available === originalItem.is_available &&
      item.vegan === originalItem.vegan &&
      item.alcohol_free === originalItem.alcohol_free
    ) {
      setEditingItem(null)
      setSavingItemId(null)
      return
    }
    
    setEditingItem(null)
    
    try {
      const res = await fetch('/api/admin/menu-item/update', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (!res.ok) {
        // Revert changes if update failed
        if (originalItem) {
          const revertedCategories = categories.map((cat: Category) =>
            cat.id === item.category_id
              ? {
                  ...cat,
                  menu_items: cat.menu_items.map((i: MenuItem) =>
                    i.id === item.id ? originalItem : i
                  ),
                }
              : cat
          )
          setCategories(revertedCategories)
        }
        toast.error(data?.error || "Erreur lors de la sauvegarde de l'élément")
        return
      }
      
      // Update the categories state with the saved item data
      const updatedCategories = categories.map((cat: Category) =>
        cat.id === item.category_id
          ? {
              ...cat,
              menu_items: cat.menu_items.map((i: MenuItem) =>
                i.id === item.id ? item : i
              ),
            }
          : cat
      )
      setCategories(updatedCategories)
      
      toast.success("Élément sauvegardé !")
    } catch (error) {
      // Revert changes on network error
      if (originalItem) {
        const revertedCategories = categories.map((cat: Category) =>
          cat.id === item.category_id
            ? {
                ...cat,
                menu_items: cat.menu_items.map((i: MenuItem) =>
                  i.id === item.id ? originalItem : i
                ),
              }
            : cat
        )
        setCategories(revertedCategories)
      }
      toast.error("Erreur lors de la sauvegarde de l'élément")
    } finally {
      setSavingItemId(null)
    }
  }

  const handleItemChange = (catId: string, itemId: string, field: string, value: any) => {
    const newCategories = categories.map((cat: Category) =>
      cat.id === catId
        ? {
            ...cat,
            menu_items: cat.menu_items.map((item: MenuItem) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          }
        : cat
    )
    setCategories(newCategories)
  }

  return {
    addMenuItem,
    deleteMenuItem,
    saveItem,
    handleItemChange,
    savingItemId,
    editingItem,
    setEditingItem,
  }
}
