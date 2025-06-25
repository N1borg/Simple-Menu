'use client'

import { useState } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase'
import type { Category, MenuItem } from '@/types/supabase_types'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Pencil, Plus, Trash2, AlertTriangle } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"

const DISPLAY_STYLES = [
  { value: 'card', label: 'Carte' },
  { value: 'list', label: 'Liste' },
  { value: 'compact', label: 'Compact' },
  { value: 'table', label: 'Tableau' },
]

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

export default function AdminDashboard({ establishment }: AdminDashboardProps) {
  const [savingItemId, setSavingItemId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [categories, setCategories] = useState(
    establishment.categories.map(cat => ({
      ...cat,
      menu_items: cat.menu_items.map(item => ({ ...item }))
    }))
  )
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'category' | 'item', catId: string, itemId?: string } | null>(null)

  const isDemo = establishment.slug === 'demo'

  // For demo: allow client-side visual changes only (no API call)
  const [demoLogoUrl, setDemoLogoUrl] = useState<string | undefined>(isDemo ? (establishment.logo_url ?? undefined) : undefined)

  const addCategory = () => {
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
    setCategories([...categories, newCat])
  }

  // Add a new menu item (API call if not demo)
  const addMenuItem = async (catId: string) => {
    if (isDemo) {
      setCategories(cats =>
        cats.map(cat =>
          cat.id === catId
            ? {
                ...cat,
                menu_items: [
                  ...cat.menu_items,
                  {
                    id: `new-${Date.now()}`,
                    name: "Nouvel élément",
                    description: "",
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
      )
      return
    }
    const tempId = `temp-${Date.now()}`;
    const tempItem = {
      id: tempId,
      name: "Nouvel élément",
      description: "",
      price: 0,
      is_available: true,
      display_order: categories.find(cat => cat.id === catId)?.menu_items.length ?? 0,
      category_id: catId,
      created_at: new Date().toISOString(),
      display_style: null,
      image_url: null,
      order: null,
    };
    setCategories(cats =>
      cats.map(cat =>
        cat.id === catId
          ? { ...cat, menu_items: [...cat.menu_items, tempItem] }
          : cat
      )
    );
    // API call
    const res = await fetch('/api/admin/menu-item/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempItem),
    });
    const data = await res.json();
    if (res.ok && data && data.item) {
      // Replace temp item with real item
      setCategories(cats =>
        cats.map(cat =>
          cat.id === catId
            ? {
                ...cat,
                menu_items: cat.menu_items.map(item =>
                  item.id === tempId ? data.item : item
                ),
              }
            : cat
        )
      );
      toast.success("Élément créé");
    } else {
      // Remove temp item on error
      setCategories(cats =>
        cats.map(cat =>
          cat.id === catId
            ? {
                ...cat,
                menu_items: cat.menu_items.filter(item => item.id !== tempId),
              }
            : cat
        )
      );
      toast.error("Erreur lors de la création");
    }
  };

  // Delete a menu item (API call if not demo)
  const deleteMenuItem = async (catId: string, itemId: string) => {
    if (isDemo) {
      setCategories(cats =>
        cats.map(cat =>
          cat.id === catId
            ? {
                ...cat,
                menu_items: cat.menu_items.filter(item => item.id !== itemId),
              }
            : cat
        )
      )
      toast.info("Élément supprimé (démo, non sauvegardé)")
      return
    }
    const prevItems = categories.find(cat => cat.id === catId)?.menu_items || [];
    const removedItem = prevItems.find(item => item.id === itemId);
    setCategories(cats =>
      cats.map(cat =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: cat.menu_items.filter(item => item.id !== itemId),
            }
          : cat
      )
    );
    // API call
    const res = await fetch('/api/admin/menu-item/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast.success("Élément supprimé");
    } else {
      // Revert on error
      if (removedItem) {
        setCategories(cats =>
          cats.map(cat =>
            cat.id === catId
              ? {
                  ...cat,
                  menu_items: [...cat.menu_items, removedItem],
                }
              : cat
          )
        );
      }
      toast.error("Erreur lors de la suppression");
    }
  };

  const deleteCategory = (catId: string) => {
    if (isDemo) {
      // Suppression purement client-side en mode démo
      setCategories(cats => cats.filter(cat => cat.id !== catId))
      toast.info("Catégorie supprimée (démo, non sauvegardé)")
      return
    }
    setCategories(cats => cats.filter(cat => cat.id !== catId))
  }

  const handleItemChange = (catId: string, itemId: string, field: string, value: any) => {
    setCategories(cats =>
      cats.map(cat =>
        cat.id === catId
          ? {
              ...cat,
              menu_items: cat.menu_items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    )
  }

  const saveItem = async (item: any) => {
    if (isDemo) {
      setEditingItem(null)
      toast.info("Modification enregistrée (démo, non sauvegardé)")
      return
    }
    setSavingItemId(item.id)

    // 1. Store previous state
    const prevCategories = JSON.parse(JSON.stringify(categories))

    // 2. Optimistically update UI (already done by handleItemChange)
    setEditingItem(null)

    // 3. API call
    const res = await fetch('/api/admin/menu-item/update', {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json' },
    })
    const ok = await res.json()
    setSavingItemId(null)

    if (ok === true) {
      toast.success("Sauvegardé", { description: "Les modifications ont été enregistrées." })
    } else {
      // 4. Rollback on error
      setCategories(prevCategories)
      toast.error("Erreur", { description: "Échec de la sauvegarde. Modifications annulées." })
    }
  }

  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    if (confirmDelete.type === 'item' && confirmDelete.itemId) {
      deleteMenuItem(confirmDelete.catId, confirmDelete.itemId)
    } else if (confirmDelete.type === 'category') {
      deleteCategory(confirmDelete.catId)
    }
    setConfirmDelete(null)
  }

  function renderMenuItem(item: any, cat: any) {
    return (
      <div key={item.id} className="relative group">
        {/* Button group: Edit and Delete */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Popover open={editingItem === item.id} onOpenChange={open => setEditingItem(open ? item.id : null)}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="opacity-70 hover:opacity-100" title="Modifier">
                <Pencil className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  saveItem(item)
                }}
                className="space-y-3"
              >
                {/* ...form fields... */}
                <Label>Nom</Label>
                <Input
                  value={item.name}
                  onChange={e => handleItemChange(cat.id, item.id, 'name', e.target.value)}
                />
                <Label>Description</Label>
                <Input
                  value={item.description || ''}
                  onChange={e => handleItemChange(cat.id, item.id, 'description', e.target.value)}
                />
                <Label>Prix</Label>
                <Input
                  type="number"
                  value={item.price?.toFixed(2) ?? ''}
                  min={0}
                  step={0.01}
                  onChange={e => handleItemChange(cat.id, item.id, 'price', parseFloat(e.target.value))}
                />
                <Label>Style d'affichage</Label>
                <Select
                  value={item.display_style || "__inherit__"}
                  onValueChange={val =>
                    handleItemChange(cat.id, item.id, 'display_style', val === "__inherit__" ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="(catégorie)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__inherit__">(catégorie)</SelectItem>
                    {DISPLAY_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Catégorie</Label>
                <Select
                  value={item.category_id || cat.id}
                  onValueChange={val => handleItemChange(cat.id, item.id, 'category_id', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {establishment.categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={item.display_order ?? 0}
                  min={0}
                  onChange={e => handleItemChange(cat.id, item.id, 'display_order', parseInt(e.target.value, 10))}
                />
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!item.is_available}
                    onChange={e => handleItemChange(cat.id, item.id, 'is_available', e.target.checked)}
                  />
                  Disponible
                </Label>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={savingItemId === item.id}>
                    {savingItemId === item.id ? (
                      <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    ) : "Enregistrer"}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEditingItem(null)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
          <Button
            size="icon"
            variant="ghost"
            className="opacity-70 hover:opacity-100"
            onClick={() => setConfirmDelete({ type: 'item', catId: cat.id, itemId: item.id })}
            title="Supprimer l'élément"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
        {/* Card style */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between group-hover:ring-2 ring-blue-400 transition">
        <div className="flex justify-between items-start">
          <h3
            className="text-lg font-semibold truncate max-w-[70%]"
            title={item.name}
          >
            {item.name}
          </h3>
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        )}
        <div className="text-right font-bold mt-2">
          {item.price?.toFixed(2)}€
        </div>
      </div>
    </div>
    )
  }

  function renderCardStyle(cat: any) {
    return (
      <section key={cat.id} className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold mr-2 mb-2 sm:mb-0">{cat.name}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">Style: {cat.display_style || 'Carte'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {DISPLAY_STYLES.map(style => (
                <DropdownMenuItem
                  key={style.value}
                  onClick={() => setCategories(cats =>
                    cats.map(c =>
                      c.id === cat.id ? { ...c, display_style: style.value } : c
                    )
                  )}
                >
                  {style.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addMenuItem(cat.id)}
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter un élément
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmDelete({ type: 'category', catId: cat.id })}
            title="Supprimer la catégorie"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cat.menu_items
            ?.sort((a: MenuItem, b: MenuItem) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item: MenuItem) => renderMenuItem(item, cat))}
        </div>
      </section>
    )
  }

  function renderListStyle(cat: any) {
    return (
      <section key={cat.id} className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
        <ul className="space-y-4">
          {cat.menu_items
            ?.sort((a: MenuItem, b: MenuItem) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item: MenuItem) => (
              <li key={item.id} className="p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right font-bold mt-2">
                    {item.price?.toFixed(2)}€
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </section>
    )
  }

  function renderCompactStyle(cat: any) {
    return (
      <section key={cat.id} className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cat.menu_items
            ?.sort((a: MenuItem, b: MenuItem) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item: MenuItem) => (
              <div key={item.id} className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
                <div className="text-right font-bold">
                  {item.price?.toFixed(2)}€
                </div>
              </div>
            ))}
        </div>
      </section>
    )
  }

  function renderTableStyle(cat: any) {
    return (
      <section key={cat.id} className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Prix</th>
            </tr>
          </thead>
          <tbody>
            {cat.menu_items
              ?.sort((a: MenuItem, b: MenuItem) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((item: MenuItem) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.description || '-'}</td>
                  <td className="px-6 py-4 text-right font-bold mt-2">
                    {item.price?.toFixed(2)}€
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    )
  }

  function renderCategoryByStyle(cat: any) {
    switch (cat.display_style) {
      case 'list':
        return renderCardStyle(cat)
        // return renderListStyle(cat)
      case 'compact':
        return renderCardStyle(cat)
        // return renderCompactStyle(cat)
      case 'table':
        return renderCardStyle(cat)
        // return renderTableStyle(cat)
      case 'card':
      default:
        return renderCardStyle(cat)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Logo upload */}
      <div className="mb-4">
        <ImageUpload
          currentImageUrl={establishment.logo_url ?? undefined}
          color={establishment.primary_color ?? undefined}
          slug={establishment.slug}
          onImageUploaded={async (url: string) => {
            if (isDemo) {
              setDemoLogoUrl(url)
              toast.info("Aperçu du logo modifié (démo, non sauvegardé)")
              return
            }
            // Update logo_url in DB
            const res = await fetch("/api/admin/update-logo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: establishment.id, logo_url: url }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              toast.success("Logo mis à jour !");
              establishment.logo_url = url;
            } else {
              toast.error(data.error || "Erreur lors de la mise à jour du logo");
            }
          }}
          onDeleteLogo={isDemo ? () => { setDemoLogoUrl(undefined); toast.info("Logo supprimé (démo, non sauvegardé)") } : undefined}
        />
      </div>
      {/* Add new category button */}
      <div className="flex justify-end mb-4">
        <Button onClick={addCategory} variant="default">
          <Plus className="w-4 h-4 mr-1" /> Nouvelle catégorie
        </Button>
      </div>
      <div className="space-y-8">
        {categories
          ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(renderCategoryByStyle)}
      </div>
      {/* Confirmation Dialog for Delete Action */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto text-center"
            onClick={e => e.stopPropagation()}
          >
            <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-3" />
            <p className="mb-6 text-base text-gray-800 font-semibold">
              {confirmDelete.type === 'category'
                ? "Supprimer cette catégorie ? Cette action est irréversible."
                : "Supprimer cet élément ? Cette action est irréversible."}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="min-w-[100px]"
                onClick={() => setConfirmDelete(null)}
              >Annuler</Button>
              <Button
                variant="destructive"
                className="min-w-[100px] transition-colors duration-150 hover:bg-red-700 hover:border-red-700 focus:ring-2 focus:ring-red-300"
                onClick={handleConfirmDelete}
              >Supprimer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
