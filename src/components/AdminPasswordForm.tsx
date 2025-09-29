import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface AdminPasswordFormProps {
  establishmentId: string
  slug: string
  isDemo: boolean
  establishmentColor?: string
}

const FormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Mot de passe actuel requis.' }),
  newPassword: z.string().min(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' }),
  confirmPassword: z.string().min(1, { message: 'Veuillez confirmer le nouveau mot de passe.' }),
})
.refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmPassword'],
})

export default function AdminPasswordForm({ establishmentId, slug, isDemo, establishmentColor }: AdminPasswordFormProps) {
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        establishmentId,
        slug,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok && data.success) {
      toast.success("Mot de passe modifié avec succès !")
      form.reset()
    } else {
      toast.error(data.error || 'Erreur lors de la modification du mot de passe.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full px-4">
        <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe actuel</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showCurrent ? "text" : "password"} autoComplete="current-password" placeholder="Mot de passe actuel" {...field} autoFocus={false} disabled={isDemo} />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      onClick={() => setShowCurrent(v => !v)}
                      aria-label={showCurrent ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      disabled={isDemo}
                    >
                      {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} autoComplete="new-password" placeholder="Nouveau mot de passe" {...field} disabled={isDemo} />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      onClick={() => setShowNew(v => !v)}
                      aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      disabled={isDemo}
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Confirmer le mot de passe" {...field} disabled={isDemo} />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      disabled={isDemo}
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={loading || isDemo}
            className="w-full mt-2 cursor-pointer"
            style={{
              backgroundColor: establishmentColor || '#3b82f6',
              color: 'white'
            }}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                Modification...
              </div>
            ) : (
              'Modifier le mot de passe'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
