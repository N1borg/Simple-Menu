'use client'

import { useState } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase'

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

const DISPLAY_STYLES = [
  { value: 'card', label: 'Carte' },
  { value: 'list', label: 'Liste' },
  { value: 'compact', label: 'Compact' },
  { value: 'table', label: 'Tableau' },
]

export default function AdminDashboard({ establishment }: AdminDashboardProps) {
  const [menuItems, setMenuItems] = useState(() =>
    (establishment.categories || []).flatMap((cat) =>
      (cat.menu_items || []).map((item) => ({
        ...item,
        category_name: cat.name,
      }))
    )
  )

  const handleChange = (id: string | number, field: string, value: string | number | boolean) => {
    setMenuItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const saveItem = async (item: any) => {
    const res = await fetch('/api/menu-item/update', {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json' },
    })

    const ok = await res.json()
    if (ok === true) alert('✅ Sauvegardé')
    else alert('❌ Échec de la sauvegarde')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Modifier le menu</h1>
      {menuItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded shadow p-4 mb-6 space-y-2 border"
        >
          <p className="text-sm text-gray-600 italic">
            Catégorie :&nbsp;
            <select
              value={item.category_id || ''}
              onChange={e => handleChange(item.id, 'category_id', e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              {establishment.categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </p>
          <input
            value={item.name || ''}
            onChange={(e) => handleChange(item.id, 'name', e.target.value)}
            className="w-full border-b text-lg font-bold p-1"
          />
          <textarea
            value={item.description || ''}
            onChange={(e) =>
              handleChange(item.id, 'description', e.target.value)
            }
            className="w-full border text-sm p-1"
            placeholder="Description"
          />
          <input
            type="number"
            value={item.price ?? ''}
            onChange={(e) => handleChange(item.id, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full border text-sm p-1"
            min={0}
            step={0.01}
          />
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm mt-1">
              <input
                type="checkbox"
                checked={!!item.is_available}
                onChange={(e) =>
                  handleChange(item.id, 'is_available', e.target.checked)
                }
              />
              Disponible
            </label>
            <label className="flex items-center gap-2 text-sm mt-1">
              Ordre d'affichage :
              <input
                type="number"
                value={item.display_order ?? 0}
                onChange={e => handleChange(item.id, 'display_order', parseInt(e.target.value, 10))}
                className="border rounded px-2 py-1 w-16"
                min={0}
              />
            </label>
            <label className="flex items-center gap-2 text-sm mt-1">
              Style :
              <select
                value={item.display_style || ''}
                onChange={e => handleChange(item.id, 'display_style', e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">(hérite de la catégorie)</option>
                {DISPLAY_STYLES.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={() => saveItem(item)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            💾 Enregistrer
          </button>
        </div>
      ))}
    </div>
  )
}
