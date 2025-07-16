'use client'

 import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { convertToLegacyHours, sanitizeEmail, sanitizePhone, sanitizeText, sanitizeFacebookUrl, sanitizeInstagramUrl, getEstablishmentColor } from '@/lib/utils'
import { Eye, EyeOff, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import ColorSelector from '@/components/ColorSelector'
import { EstablishmentInfoForm, validateEstablishmentInfo } from '@/components/EstablishmentInfoForm'
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
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const [logoUrl, setLogoUrl] = useState(currentLogo || '')
  
  // Color selection - Start with empty so WelcomeSetup guides user through color selection
  const [selectedColor, setSelectedColor] = useState('')

  // Establishment info
  const [establishmentInfo, setEstablishmentInfo] = useState({
    address: '',
    phone: '',
    email: '',
    opening_hours: [] as Array<{ day: string; hours: string }>,
    facebook_url: '',
    instagram_url: ''
  })

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
    { title: "Choisir votre couleur", required: true },
    { title: "Informations de l'établissement", required: false }
  ]

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return passwordForm.formState.isValid
      case 1: return !!logoUrl // Only valid if a logo is present
      case 2: return selectedColor !== ''
      case 3: 
        // Always allow progression if format validation passes (even if empty)
        const validation = validateEstablishmentInfo(establishmentInfo)
        return validation.isValid // This will be true if no format errors, regardless of completeness
      default: return false
    }
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!isStepValid()) {
      if (currentStep === 3) {
        const validation = validateEstablishmentInfo(establishmentInfo)
        validation.errors.forEach(error => toast.error(error))
      }
      return
    }

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
      // Validate establishment info before submitting
      const validation = validateEstablishmentInfo(establishmentInfo)
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error))
        setIsLoading(false)
        return
      }

      // Prepare all data for a single API call
      const setupData = {
        logo_url: logoUrl && logoUrl !== currentLogo ? logoUrl : undefined,
        primary_color: selectedColor,
        establishment_info: {
          address: sanitizeText(establishmentInfo.address, 200),
          phone: sanitizePhone(establishmentInfo.phone),
          email: sanitizeEmail(establishmentInfo.email),
          opening_hours: establishmentInfo.opening_hours.length > 0 ? establishmentInfo.opening_hours : undefined,
          facebook_url: sanitizeFacebookUrl(establishmentInfo.facebook_url),
          instagram_url: sanitizeInstagramUrl(establishmentInfo.instagram_url)
        }
      }

      // Make individual API calls (we can optimize this later to a single endpoint)
      const promises = []

      // Update logo if provided
      if (setupData.logo_url) {
        promises.push(
          fetch('/api/admin/update-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: establishmentId,
              logo_url: setupData.logo_url
            })
          })
        )
      }

      // Update color
      promises.push(
        fetch('/api/admin/update-color', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: setupData.primary_color
          })
        })
      )

      // Update establishment info if any data provided
      const hasEstablishmentData = Object.values(setupData.establishment_info).some(value => 
        value !== undefined && (Array.isArray(value) ? value.length > 0 : value !== '')
      )
      
      if (hasEstablishmentData) {
        promises.push(
          fetch('/api/admin/establishment-info/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setupData.establishment_info)
          })
        )
      }

      // Execute all API calls
      const responses = await Promise.all(promises)
      
      // Check if all responses are ok
      for (const response of responses) {
        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde de la configuration')
        }
      }

      toast.success('Configuration terminée avec succès !')
      onComplete()
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
              <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4 max-w-lg mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bienvenue {establishmentName} !
                  </h3>
                  <p className="text-gray-600">
                    Définissez votre nouveau mot de passe pour sécuriser votre compte.
                  </p>
                </div>
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Minimum 6 caractères"
                            {...field}
                            className={fieldState.error ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}
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
                      {fieldState.error && (
                        <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Confirmer le mot de passe"
                            {...field}
                            className={fieldState.error ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}
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
                      {fieldState.error && (
                        <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )

      case 1: // Logo upload
        return (
          <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentLogo ? "Modifier votre logo" : "Ajoutez votre logo"}
              </h3>
              <p className="text-gray-600">
                {currentLogo 
                  ? "Vous pouvez modifier votre logo ou conserver l'actuel."
                  : "Personnalisez votre menu avec votre logo."
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
          </div>
        )

      case 2: // Color selection
        return (
          <div className="rounded-xl bg-white border shadow-sm p-6 space-y-4 max-w-lg mx-auto">
            <ColorSelector
              currentColor={selectedColor}
              onColorChange={setSelectedColor}
              showSaveButton={false}
              title="Choisissez votre couleur"
              description="Sélectionnez la couleur principale qui représentera votre établissement."
            />
          </div>
        )

      case 3: // Establishment info
        return (
          <EstablishmentInfoForm
            establishmentId={establishmentId}
            onDataChange={setEstablishmentInfo}
            primaryColor={selectedColor}
          />
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
                index <= currentStep ? '' : 'bg-gray-200'
              }`}
              style={index <= currentStep ? { 
                backgroundColor: getEstablishmentColor(currentStep >= 2 ? selectedColor : null)
              } : {}}
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
            disabled={isLoading || !isStepValid()}
            className="cursor-pointer"
            style={currentStep >= 2 ? { 
              backgroundColor: getEstablishmentColor(selectedColor), 
              borderColor: getEstablishmentColor(selectedColor) 
            } : { 
              backgroundColor: getEstablishmentColor(null), 
              borderColor: getEstablishmentColor(null) 
            }}
          >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  Configuration...
                </div>
              ) : currentStep === steps.length - 1 ? (
                'Terminer'
              ) : currentStep === 3 ? (
                'Suivant →' // Don't show complete on establishment info step
              ) : (
                'Suivant →'
              )}
            </Button>
        </div>
      </div>
    </div>
  )
}
