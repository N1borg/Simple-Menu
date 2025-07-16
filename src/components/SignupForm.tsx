'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Building, CreditCard, Check } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SignupFormSchema = z.object({
  // Establishment info
  establishmentName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  establishmentSlug: z.string()
    .min(3, 'Le slug doit contenir au moins 3 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  
  // Contact info
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  
  // Subscription plan
  plan: z.enum(['essentiel', 'pro', 'premium']),
})

type SignupFormData = z.infer<typeof SignupFormSchema>

interface SignupFormProps {
  onClose: () => void
  selectedPlan?: string
}

const PLANS = {
  essentiel: {
    name: 'Essentiel',
    originalPrice: '13,99€',
    promoPrice: '6,99€',
    description: '5 catégories • 50 produits',
    features: ['Menu QR code', 'Édition en temps réel', 'Couleurs personnalisées', 'Support email']
  },
  pro: {
    name: 'Pro', 
    originalPrice: '25,99€',
    promoPrice: '12,99€',
    description: '15 catégories • 200 produits',
    features: ['Toutes les fonctionnalités Essentiel', 'Application mobile', 'QR codes imprimés', 'Photos personnalisées', 'Support prioritaire']
  },
  premium: {
    name: 'Premium',
    originalPrice: '39,99€',
    promoPrice: '19,99€',
    description: 'Illimité',
    features: ['Toutes les fonctionnalités Pro', 'Menu multilingue', 'Statistiques avancées', 'API personnalisée', 'Setup complet offert']
  }
}

export function SignupForm({ onClose, selectedPlan = 'pro' }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      plan: selectedPlan as 'essentiel' | 'pro' | 'premium',
    },
  })

  const watchedEstablishmentName = form.watch('establishmentName')
  
  // Auto-generate slug from establishment name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Auto-generate slug when establishment name changes
  useEffect(() => {
    if (watchedEstablishmentName) {
      const slug = generateSlug(watchedEstablishmentName)
      form.setValue('establishmentSlug', slug)
    }
  }, [watchedEstablishmentName, form])

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      // Create establishment and redirect to Stripe checkout
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription')
      }

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        toast.success('Redirection vers le paiement...')
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('URL de paiement non générée')
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlanData = PLANS[form.watch('plan')]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Créez votre menu digital
        </h2>
        <p className="text-gray-600">
          Informations de votre établissement
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
                {/* Plan Selection */}
                <div className="mb-6">
                  <Label className="text-base font-medium">Plan sélectionné</Label>
                  <div className="mt-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-700">{selectedPlanData.name}</h4>
                        <p className="text-sm text-gray-600">{selectedPlanData.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">{selectedPlanData.originalPrice}</div>
                        <div className="text-lg font-bold text-blue-700">{selectedPlanData.promoPrice}</div>
                        <div className="text-xs text-green-600">-50% les 3 premiers mois</div>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Changer de plan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PLANS).map(([key, plan]) => (
                              <SelectItem key={key} value={key}>
                                {plan.name} - {plan.promoPrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Establishment Info */}
                <FormField
                  control={form.control}
                  name="establishmentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Nom de votre établissement
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Le Café de la Paix" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="establishmentSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de votre menu</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            /
                          </span>
                          <Input 
                            placeholder="le-cafe-de-la-paix" 
                            className="rounded-l-none"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email de contact
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@cafe-paix.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="01 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Récapitulatif de votre commande</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan {selectedPlanData.name}</span>
                      <span className="line-through text-gray-500">{selectedPlanData.originalPrice}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Offre de lancement (-50%)</span>
                      <span>-{(() => {
                        const original = parseFloat(selectedPlanData.originalPrice.replace('€', '').replace(',', '.'))
                        const promo = parseFloat(selectedPlanData.promoPrice.replace('€', '').replace(',', '.'))
                        return `${(original - promo).toFixed(2).replace('.', ',')}€`
                      })()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>2 semaines GRATUITES</span>
                      <span className="text-green-600">0,00€</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>3 mois suivants</span>
                      <span>{selectedPlanData.promoPrice}/mois</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Puis tarif normal</span>
                      <span>{selectedPlanData.originalPrice}/mois</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Annuler
                  </Button>
                  
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Création...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Continuer vers le paiement
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      )
    }
