'use client'

 import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff, CheckCircle2, Upload, Loader2Icon } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import ColorSelector from '@/components/ColorSelector'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface WelcomeSetupProps {
  isOpen: boolean
  onComplete: () => void
  establishmentName: string
  establishmentSlug: string
  establishmentId: string
  currentLogo?: string
}

const PasswordFormSchema = z.object({
  newPassword: z.string().min(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' }),
  confirmPassword: z.string().min(1, { message: 'Veuillez confirmer le nouveau mot de passe.' }),
})
.refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmPassword'],
})

export function WelcomeSetup({ 
  isOpen, 
  onComplete, 
  establishmentName,
  establishmentSlug,
  establishmentId,
  currentLogo
}: WelcomeSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Password setup
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // React Hook Form for password step
  const passwordForm = useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const [logoUrl, setLogoUrl] = useState(currentLogo || '')
  
  // Color selection
  const [selectedColor, setSelectedColor] = useState('#3b82f6')

  // Add keyboard event handler for Enter key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        // Don't trigger if we're in an input field that should handle Enter naturally
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }
        
        // Don't trigger if loading or step is not valid
        if (isLoading || !isStepValid()) {
          return
        }
        
        event.preventDefault()
        handleNext()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isLoading, currentStep, passwordForm.formState.isValid, selectedColor])

  const steps = [
    { title: "Définir votre mot de passe", required: true },
    { title: "Ajouter votre logo", required: false },
    { title: "Choisir votre couleur", required: true }
  ]

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return passwordForm.formState.isValid
      case 1: return true
      case 2: return selectedColor !== ''
      default: return false
    }
  }

  const handleNext = async () => {
    // If on password step, validate and set password before proceeding
    if (currentStep === 0) {
      setIsLoading(true)
      try {
        const formData = passwordForm.getValues()
        const passwordResponse = await fetch('/api/admin/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newPassword: formData.newPassword
          })
        })
        if (!passwordResponse.ok) {
          throw new Error('Erreur lors de la définition du mot de passe')
        }
        setCurrentStep(prev => prev + 1)
      } catch (error) {
        console.error('Password setup error:', error)
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la configuration du mot de passe')
      } finally {
        setIsLoading(false)
      }
      return
    }
    // If on last step, complete setup
    if (currentStep === steps.length - 1) {
      await handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    if (!steps[currentStep].required) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // 2. Update logo if provided
      if (logoUrl && logoUrl !== currentLogo) {
        const logoResponse = await fetch('/api/admin/update-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: establishmentId,
            logo_url: logoUrl
          })
        })
        if (!logoResponse.ok) {
          throw new Error('Erreur lors de la mise à jour du logo')
        }
      }
      // 3. Update color
      const colorResponse = await fetch('/api/admin/update-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: selectedColor
        })
      })
      if (!colorResponse.ok) {
        throw new Error('Erreur lors de la mise à jour de la couleur')
      }
      toast.success('Configuration terminée avec succès !')
      onComplete()
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Configuration error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Password setup
        return (
          <Form {...passwordForm}>
            <form className="w-full">
              <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bienvenue {establishmentName} ! 👋
                  </h3>
                  <p className="text-gray-600">
                    Définissez votre nouveau mot de passe pour sécuriser votre compte.
                  </p>
                </div>
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Minimum 6 caractères"
                            {...field}
                            autoFocus={false}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && isStepValid() && !isLoading) {
                                e.preventDefault()
                                handleNext()
                              }
                            }}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
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
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Confirmer le mot de passe"
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && isStepValid() && !isLoading) {
                                e.preventDefault()
                                handleNext()
                              }
                            }}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )

      case 1: // Logo upload
        return (
          <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentLogo ? "Modifier votre logo 📸" : "Ajoutez votre logo 📸"}
              </h3>
              <p className="text-gray-600">
                {currentLogo 
                  ? "Vous pouvez modifier votre logo ou conserver l'actuel (cette étape est optionnelle)."
                  : "Personnalisez votre menu avec votre logo (cette étape est optionnelle)."
                }
              </p>
              {currentLogo && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle2 size={16} />
                  <span>Logo actuel configuré</span>
                </div>
              )}
            </div>
            
            <ImageUpload
              currentImageUrl={logoUrl}
              onImageUploaded={(url: string) => setLogoUrl(url)}
              slug={establishmentSlug}
              establishmentId={establishmentId}
            />
            
            {logoUrl && (
              <div className="mt-4 text-center">
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  className="max-w-32 max-h-32 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        )

      case 2: // Color selection
        return (
          <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4">
            <ColorSelector
              currentColor={selectedColor}
              onColorChange={setSelectedColor}
              showSaveButton={false}
              title="Choisissez votre couleur"
              description="Sélectionnez la couleur principale qui représentera votre établissement."
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Configuration initiale
        </h1>
        <div className="flex items-center gap-2 justify-center text-2xl mb-6">
          <span>{steps[currentStep].title}</span>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mb-8 max-w-md mx-auto">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px] mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 border-t max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          ← Retour
        </Button>

        <div className="flex gap-2">
          {!steps[currentStep].required && currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Ignorer
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className="cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                Configuration...
              </>
            ) : currentStep === steps.length - 1 ? (
              'Terminer ✨'
            ) : (
              'Suivant →'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
