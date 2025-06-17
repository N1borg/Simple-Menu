'use client'

import { /* useEffect, */useState } from 'react'
import { createPagesBrowserClient  } from '@supabase/auth-helpers-nextjs'
import { useRouter, useParams } from 'next/navigation'
import type { Database } from '@/types/supabase'

export default function AdminPage() {
  const supabase = createPagesBrowserClient<Database>()
//   const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [auth, setAuth] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [establishment, setEstablishment] = useState<any>(null)

  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const { data, error } = await supabase
      .from('establishments')
      .select(`*, categories (*, menu_items (*))`)
      .eq('slug', slug)
      .single()

    if (error || !data) return
    setEstablishment(data)

    const flatItems = data.categories.flatMap((cat: any) => cat.menu_items.map((i: any) => ({ ...i, category: cat.name })))
    setMenuItems(flatItems)
    setLoading(false)
  }

  async function checkPassword() {
    const { data } = await supabase
      .from('establishments')
      .select('admin_hash')
      .eq('slug', slug)
      .single()

    if (!data?.admin_hash) return

    const res = await fetch('/api/verify-password', {
      method: 'POST',
      body: JSON.stringify({ hash: data.admin_hash, password: passwordInput }),
    })

    const ok = await res.json()
    if (ok === true) {
      setAuth(true)
      loadData()
    }
  }

  async function updateItem(item: any) {
    await supabase.from('menu_items').update({
      name: item.name,
      description: item.description,
      price: item.price,
      is_available: item.is_available,
    }).eq('id', item.id)
    alert('Enregistré ✅')
  }

  if (!auth) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        <h1 className="text-xl font-bold mb-4">Connexion admin</h1>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          placeholder="Mot de passe"
        />
        <button onClick={checkPassword} className="bg-black text-white px-4 py-2 rounded">
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Édition du menu — {establishment.name}</h1>
      {loading && <p>Chargement...</p>}
      {!loading && menuItems.map((item) => (
        <div key={item.id} className="bg-white shadow p-4 rounded mb-4">
          <input
            className="font-bold text-lg w-full border-b mb-2"
            value={item.name}
            onChange={(e) => setMenuItems((prev) => prev.map((it) => it.id === item.id ? { ...it, name: e.target.value } : it))}
          />
          <textarea
            className="w-full text-sm border mb-2"
            value={item.description || ''}
            onChange={(e) => setMenuItems((prev) => prev.map((it) => it.id === item.id ? { ...it, description: e.target.value } : it))}
          />
          <input
            type="number"
            className="w-full border mb-2"
            value={item.price}
            onChange={(e) => setMenuItems((prev) => prev.map((it) => it.id === item.id ? { ...it, price: parseFloat(e.target.value) } : it))}
          />
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={item.is_available}
              onChange={(e) => setMenuItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_available: e.target.checked } : it))}
            />
            Disponible
          </label>
          <button onClick={() => updateItem(item)} className="bg-green-600 text-white px-4 py-1 rounded">
            Enregistrer
          </button>
        </div>
      ))}
    </div>
  )
}
