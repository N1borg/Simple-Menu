"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2Icon } from "lucide-react"

interface AdminLoginFormProps {
  slug: string
  color?: string
  error?: string
}

export default function AdminLoginForm({ slug, color, error }: AdminLoginFormProps) {
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
      {formError && (
        <div className="text-red-500 text-sm">{formError}</div>
      )}
      <Button
        type="submit"
        className="w-full flex justify-center py-2 px-4"
        disabled={loading}
        style={color ? { backgroundColor: color, borderColor: color, color: '#fff' } : {}}
      >
        {loading ? (
          <>
            <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
            Connexion...
          </>
        ) : 'Se connecter'}
      </Button>
    </form>
  )
}
