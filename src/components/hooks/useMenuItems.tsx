import { useState } from 'react'
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
                  price: 0,
                  is_available: true,
                  display_order: cat.menu_items.length,
                  category_id: catId,
                  created_at: new Date().toISOString(),
                  display_style: null,
                  image_url: null,
                  order: null,
                },
              ],
            }
          : cat
      )
      setCategories(newCategories)
      return
    }
    const tempId = `temp-${Date.now()}`
    const tempItem = {
      id: tempId,
      name: 'Nouvel élément',
      description: '',
      price: 0,
      is_available: true,
      display_order: categories.find((cat: Category) => cat.id === catId)?.menu_items.length ?? 0,
      category_id: catId,
      created_at: new Date().toISOString(),
      display_style: null,
      image_url: null,
      order: null,
    }
    const newCategories = categories.map((cat: Category) =>
      cat.id === catId
        ? { ...cat, menu_items: [...cat.menu_items, tempItem] }
        : cat
    )
    setCategories(newCategories)
    setEditingItem(tempId)
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
    const prevItems = categories.find((cat: Category) => cat.id === catId)?.menu_items || []
    const removedItem = prevItems.find((item: MenuItem) => item.id === itemId)
    const newCategories = categories.map((cat: Category) =>
      cat.id === catId
        ? {
            ...cat,
            menu_items: cat.menu_items.filter((item: MenuItem) => item.id !== itemId),
          }
        : cat
    )
    setCategories(newCategories)
    const res = await fetch('/api/admin/menu-item/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    })
    const data = await res.json()
    if (!(res.ok && data.success) && removedItem) {
      const revertCategories = categories.map((cat: Category) =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: [...cat.menu_items, removedItem],
            }
          : cat
      )
      setCategories(revertCategories)
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
      }
      return
    }
    // Only call update if something changed
    if (
      originalItem &&
      item.name === originalItem.name &&
      item.description === originalItem.description &&
      item.price === originalItem.price &&
      item.display_style === originalItem.display_style &&
      item.display_order === originalItem.display_order &&
      item.is_available === originalItem.is_available
    ) {
      setEditingItem(null)
      setSavingItemId(null)
      return
    }
    setEditingItem(null)
    const res = await fetch('/api/admin/menu-item/update', {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json' },
    })
    setSavingItemId(null)
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
