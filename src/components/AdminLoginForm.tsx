"use client"
import { useState } from 'react'

interface AdminLoginFormProps {
  slug: string
  error?: string
}

export default function AdminLoginForm({ slug, error }: AdminLoginFormProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(error)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(undefined)
    const res = await fetch(`/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, password }),
    })
    setLoading(false)
    if (res.ok) {
      window.location.reload()
    } else {
      const data = await res.json()
      setFormError(data.error || 'Erreur inconnue')
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe administrateur
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      {formError && (
        <div className="text-red-500 text-sm">{formError}</div>
      )}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
