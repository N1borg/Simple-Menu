'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Building, CreditCard } from 'lucide-react'
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
    detailedFeatures: [
      'Menu digital responsive optimisé mobile et ordinateur',
      'QR codes personnalisés avec votre logo',
      'Jusqu\'à 5 catégories de produits',
      'Jusqu\'à 50 produits au total',
      'Modifications en temps réel sans interruption',
      'Personnalisation des couleurs',
      'Accès administrateur sécurisé',
      'Support par email sous 24h',
      'Hébergement sécurisé et sauvegarde quotidienne',
      'Mises à jour automatiques incluses'
    ]
  },
  pro: {
    name: 'Pro', 
    originalPrice: '25,99€',
    promoPrice: '12,99€',
    description: '15 catégories • 200 produits',
    detailedFeatures: [
      'Menu digital responsive optimisé mobile et ordinateur',
      'QR codes personnalisés avec votre logo',
      'Jusqu\'à 15 catégories de produits',
      'Jusqu\'à 200 produits au total',
      'Modifications en temps réel sans interruption',
      'Personnalisation des couleurs',
      'Accès administrateur sécurisé',
      'Support prioritaire par email ET téléphone',
      'Hébergement sécurisé et sauvegarde quotidienne',
      'Mises à jour automatiques incluses',
      'Application mobile dédiée pour la gestion',
      '10 QR codes physiques imprimés et livrés (bientôt)',
      'Upload de photos personnalisées pour vos plats/boissons',
      'Gestion avancée des disponibilités',
      'Gestion des horaires d\'ouverture détaillées',
      'Annonces et promotions en temps réel'
    ]
  },
  premium: {
    name: 'Premium',
    originalPrice: '39,99€',
    promoPrice: '19,99€',
    description: 'Illimité',
    detailedFeatures: [
      'Menu digital responsive optimisé mobile et ordinateur',
      'QR codes personnalisés avec votre logo',
      'Catégories et produits ILLIMITÉS',
      'Modifications en temps réel sans interruption',
      'Personnalisation des couleurs',
      'Accès administrateur sécurisé',
      'Support téléphonique prioritaire dédié',
      'Hébergement sécurisé et sauvegarde quotidienne',
      'Mises à jour automatiques incluses',
      'Application mobile dédiée pour la gestion',
      '100 QR codes physiques imprimés et livrés (bientôt)',
      'Upload de photos personnalisées pour vos plats/boissons',
      'Gestion avancée des disponibilités',
      'Gestion des horaires d\'ouverture détaillées',
      'Annonces et promotions en temps réel',
      'Nom de domaine personnalisé (votre-etablissement.com)',
      'Formation personnalisée',
      'Setup complet de votre menu par notre équipe',
      'Gestion avancée des événements et menus spéciaux',
      'Statistiques détaillées des consultations',
      'API personnalisée pour intégrations tierces (bientôt)',
      'Gestionnaire de compte dédié',
      'Intégration réseaux sociaux',
      'Comptes salariés (bientôt)',
      'Réservation en ligne (en option) (bientôt)',
      'Menu multilingue (français, anglais, espagnol, italien) (bientôt)'
    ]
  }
}

export function SignupForm({ onClose, selectedPlan = 'pro' }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      plan: selectedPlan as 'essentiel' | 'pro' | 'premium',
      establishmentSlug: "",
      establishmentName: "",
      email: "",
      phone: "",
    },
  })

  const watchedEstablishmentName = form.watch('establishmentName');
  // Auto-generate slug from establishment name
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  useEffect(() => {
    if (watchedEstablishmentName) {
      const slug = generateSlug(watchedEstablishmentName);
      form.setValue('establishmentSlug', slug);
    }
  }, [watchedEstablishmentName, form]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Create establishment and redirect to Stripe checkout
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle known input errors (like URL déjà prise)
        if (result.error && typeof result.error === 'string') {
          // If the error is about the slug being taken, set it as a field error
          if (result.error.toLowerCase().includes('url est déjà prise')) {
            form.setError('establishmentSlug', { message: result.error });
            return;
          }
        }
        // If the error is related to a specific field, set it as a field error
        if (result.field && result.error) {
          form.setError(result.field, { message: result.error });
        } else if (result.errors && typeof result.errors === 'object') {
          // Multiple field errors
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof SignupFormData, { message: String(message) });
          });
        } else {
          // General error (not field-specific)
          toast.error("Erreur lors de l'inscription. Veuillez contacter contact.simplemenu@gmail.com");
        }
        return;
      }

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        toast.success('Redirection vers le paiement...');
        window.location.href = result.checkoutUrl;
      } else {
        toast.error('URL de paiement non générée');
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanData = PLANS[form.watch('plan')]

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Détails du plan {selectedPlanData.name}
        </h2>
        <p className="text-gray-600">
          Découvrez tout ce qui est inclus dans votre formule
        </p>
      </div>

      {/* Plan Selection */}
      <div className="mb-6">
        <Label className="text-base font-medium mb-3 block">Changer de plan</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                form.watch('plan') === key
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => form.setValue('plan', key as 'essentiel' | 'pro' | 'premium')}
            >
              <div className="text-center">
                <h4 className="font-semibold text-blue-700">{plan.name}</h4>
                <div className="text-sm text-gray-500 line-through">{plan.originalPrice}</div>
                <div className="text-lg font-bold text-blue-700">{plan.promoPrice}</div>
                <div className="text-xs text-gray-600 mt-1">{plan.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Header with Price */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-blue-700">{selectedPlanData.name}</h3>
            <p className="text-gray-600">{selectedPlanData.description}</p>
          </div>
          <div className="text-right">
            <div className="relative">
              <div className="text-lg text-gray-500 line-through">{selectedPlanData.originalPrice}</div>
              <div className="text-3xl font-extrabold text-blue-700">{selectedPlanData.promoPrice}</div>
              <div className="text-sm text-gray-600">/ mois</div>
              <span className="absolute -top-2 -right-6 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
                -50%
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg text-center">
            ✅ 2 semaines gratuites
          </div>
          <div className="bg-blue-100 text-blue-800 text-sm px-3 py-2 rounded-lg text-center">
            🎯 -50% les 3 premiers mois
          </div>
        </div>
      </div>

      {/* Detailed Features */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Tout ce qui est inclus dans le plan {selectedPlanData.name}
        </h4>
        <div className="grid gap-3">
          {selectedPlanData.detailedFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>


      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        
        <Button 
          type="button" 
          onClick={() => setCurrentStep(2)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Continuer l'inscription
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          Créez votre menu digital
        </h2>
        <p className="text-gray-600">
          Informations de votre établissement
        </p>
      </div>
      {/* Pricing Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Récapitulatif tarifaire</h4>
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

      {/* Selected Plan Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-700">Plan {selectedPlanData.name}</h4>
            <p className="text-sm text-gray-600">{selectedPlanData.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 line-through">{selectedPlanData.originalPrice}</div>
            <div className="text-lg font-bold text-blue-700">{selectedPlanData.promoPrice}</div>
            <div className="text-xs text-green-600">-50% les 3 premiers mois</div>
          </div>
        </div>
        <Button
          type="button"
          variant="link"
          onClick={() => setCurrentStep(1)}
          className="text-xs text-blue-600 p-0 h-auto mt-2"
        >
          Modifier le plan
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>URL de votre menu</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                        /
                      </span>
                      <Input
                        placeholder="le-cafe-de-la-paix"
                        className={`rounded-l-none ${fieldState.error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(1)} 
                className="flex-1"
              >
                Retour
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
  );

  return (
    <div className="space-y-6">
      {currentStep === 1 ? renderStep1() : renderStep2()}
    </div>
  )
}
