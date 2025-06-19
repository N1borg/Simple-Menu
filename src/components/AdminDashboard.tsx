'use client'

import { useState } from 'react'
import type { EstablishmentWithCategories } from '@/types/supabase'

interface AdminDashboardProps {
  establishment: EstablishmentWithCategories
}

export default function AdminDashboard({ establishment }: AdminDashboardProps) {
  // Defensive: ensure menu_items and categories are always arrays
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
            {item.category_name}
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
          />
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
