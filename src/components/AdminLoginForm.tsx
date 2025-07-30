'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

interface AdminLoginFormProps {
  slug: string
  error?: string
}

const FormSchema = z.object({
  password: z.string().min(1, { message: "Le mot de passe est requis." })
})

export default function AdminLoginForm({ slug, error }: AdminLoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>(error)
  const [showPassword, setShowPassword] = useState(false)
  const [publicLoading, setPublicLoading] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "" },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    setFormError(undefined)
    const res = await fetch(`/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, password: data.password }),
    })
    if (res.ok) {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } else {
      const result = await res.json()
      setFormError(result.error || 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe administrateur</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Mot de passe"
                      {...field}
                      disabled={loading}
                      autoFocus
                      onFocus={e => {
                        // Scroll input into view on mobile when focused
                        if (window.innerWidth <= 600) {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }, 200)
                        }
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {formError && (
            <div className="text-red-500 text-sm">{formError}</div>
          )}
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4"
            disabled={loading || publicLoading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full flex justify-center py-2 px-4"
            disabled={loading || publicLoading}
            onClick={() => {
              setPublicLoading(true);
              // Small delay for loading spinner to show
              setTimeout(() => {
                window.location.href = `/e/${slug}`;
              }, 150);
            }}
          >
            {publicLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                Chargement...
              </div>
            ) : (
              'Voir le menu public'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
