'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { sanitizeEmail, sanitizePhone, sanitizeText, sanitizeFacebookUrl, sanitizeInstagramUrl, convertToLegacyHours, getEstablishmentColor } from '@/lib/utils'
import { Loader2, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import EstablishmentFooter from '@/components/EstablishmentFooter'
import ContactInfoFields, { ContactFormData } from '@/components/ContactInfoFields'

interface EstablishmentInfoManagerProps {
  establishmentId: string
  slug: string
  children?: React.ReactNode
  primaryColor?: string
  isDemo?: boolean
}

const defaultHours = [] // No longer needed, kept for compatibility

export function EstablishmentInfoManager({ establishmentId, slug, children, primaryColor, isDemo = false }: EstablishmentInfoManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Use the same data structure as ContactInfoFields
  const [formData, setFormData] = useState<ContactFormData>({
    address: '',
    phone: '',
    email: '',
    facebook_url: '',
    instagram_url: ''
  })
  
  const [initialFormData, setInitialFormData] = useState<ContactFormData>({
    address: '',
    phone: '',
    email: '',
    facebook_url: '',
    instagram_url: ''
  })

  // Check if there are any changes
  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      const currentValue = formData[key as keyof ContactFormData] || ''
      const initialValue = initialFormData[key as keyof ContactFormData] || ''
      return currentValue !== initialValue
    })
  }

  // Load establishment data on mount for non-demo
  useEffect(() => {
    if (!isDemo) {
      loadEstablishmentData()
    }
  }, [isDemo])

  const loadEstablishmentData = async () => {
    if (isDemo) {
      return // Don't load data in demo mode
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/establishment-info?slug=${slug}`)
      if (response.ok) {
        const data = await response.json()
        
        const loadedFormData = {
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || ''
        }
        
        setFormData(loadedFormData)
        setInitialFormData(loadedFormData)
      } else {
        toast.error('Erreur lors du chargement des données')
      }
    } catch (error) {
      console.error('Error loading establishment data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    
    setIsSaving(true)
    try {
      // Sanitize and format inputs
      const sanitizedData = {
        ...formData,
        address: sanitizeText(formData.address, 200),
        phone: sanitizePhone(formData.phone),
        email: sanitizeEmail(formData.email),
        facebook_url: sanitizeFacebookUrl(formData.facebook_url),
        instagram_url: sanitizeInstagramUrl(formData.instagram_url)
        // Note: opening_hours are handled by OpeningHoursManager
      }

      // Check for sanitization errors
      if (formData.phone && formData.phone.trim() && !sanitizedData.phone) {
        toast.error('Le numéro de téléphone contient des caractères invalides')
        setIsSaving(false)
        return
      }

      if (formData.email && formData.email.trim() && !sanitizedData.email) {
        toast.error('L\'adresse email est trop longue (maximum 255 caractères)')
        setIsSaving(false)
        return
      }

      if (formData.facebook_url && formData.facebook_url.trim() && !sanitizedData.facebook_url) {
        toast.error('Le nom de page Facebook ne peut contenir que des lettres, chiffres, points et tirets')
        setIsSaving(false)
        return
      }

      if (formData.instagram_url && formData.instagram_url.trim() && !sanitizedData.instagram_url) {
        toast.error('Le nom d\'utilisateur Instagram ne peut contenir que des lettres, chiffres, points et underscores')
        setIsSaving(false)
        return
      }

      // Validate email if provided
      if (sanitizedData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(sanitizedData.email)) {
          toast.error('Veuillez entrer une adresse email valide')
          setIsSaving(false)
          return
        }
      }

      const response = await fetch('/api/admin/establishment-info/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData?.error || 'Erreur lors de la sauvegarde')
      }

      toast.success('Informations mises à jour avec succès!')
      // Update initial state to reflect saved changes
      setInitialFormData(formData)
      // Close dialog by triggering a close - since we're using uncontrolled, we'll reload page
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Error saving establishment data:', error)
      // Keep the user's edits - don't revert form data on error
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            style={primaryColor ? { 
              borderColor: primaryColor, 
              color: primaryColor 
            } : {}}
          >
            <MapPin 
              className="w-4 h-4" 
              style={primaryColor ? { color: primaryColor } : {}}
            />
            Contact et adresse
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            className="text-lg"
            style={primaryColor ? { color: primaryColor } : {}}
          >
            Informations de contact
          </DialogTitle>
          <DialogDescription>
            Configurez les informations de contact de votre établissement.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <ContactInfoFields
              formData={formData}
              onInputChange={handleInputChange}
              compact={true}
              primaryColor={primaryColor}
              disabled={isDemo}
            />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Annuler
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading || isDemo || !hasChanges()}
          >
            {isSaving ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </div>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
