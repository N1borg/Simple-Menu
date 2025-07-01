import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface AdminPasswordFormProps {
  establishmentId: string
  slug: string
  isDemo: boolean
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

export default function AdminPasswordForm({ establishmentId, slug, isDemo }: AdminPasswordFormProps) {
  const [loading, setLoading] = useState(false)
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
      toast.info('Modification du mot de passe désactivée en mode démo.')
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
      toast.success('Mot de passe modifié avec succès !')
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
                  <Input type="password" autoComplete="current-password" placeholder="Mot de passe actuel" {...field} />
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
                  <Input type="password" autoComplete="new-password" placeholder="Nouveau mot de passe" {...field} />
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
                  <Input type="password" autoComplete="new-password" placeholder="Confirmer le mot de passe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
