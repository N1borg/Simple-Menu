'use client'

import { useState } from 'react'
import { defaultWeekSchedule, convertLegacyHours, convertToLegacyHours, DaySchedule } from '@/lib/utils'
import EstablishmentFooter from '@/components/EstablishmentFooter'
import ContactInfoFields, { ContactFormData } from '@/components/ContactInfoFields'
import OpeningHoursInput from '@/components/OpeningHoursInput'

interface EstablishmentInfoFormProps {
  establishmentId: string
  onDataChange: (data: {
    address: string
    phone: string
    email: string
    opening_hours: Array<{ day: string; hours: string }>
    facebook_url: string
    instagram_url: string
  }) => void
  primaryColor?: string
  initialData?: {
    address?: string
    phone?: string
    email?: string
    opening_hours?: Array<{ day: string; hours: string }>
    facebook_url?: string
    instagram_url?: string
  }
}

const defaultHours = defaultWeekSchedule

export function EstablishmentInfoForm({ 
  establishmentId, 
  onDataChange,
  primaryColor,
  initialData 
}: EstablishmentInfoFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    facebook_url: initialData?.facebook_url || '',
    instagram_url: initialData?.instagram_url || ''
  })
  const [openingHours, setOpeningHours] = useState<DaySchedule[]>(
    initialData?.opening_hours ? convertLegacyHours(initialData.opening_hours) : defaultHours
  )

  // Update parent whenever data changes
  const updateParent = () => {
    onDataChange({
      ...formData,
      opening_hours: convertToLegacyHours(openingHours)
    })
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    let processedValue = value.trim()
    
    // Convert social media usernames to full URLs, but only if there's actually a value
    if (field === 'facebook_url' && processedValue && !processedValue.startsWith('http')) {
      processedValue = `https://www.facebook.com/${processedValue}`
    } else if (field === 'instagram_url' && processedValue && !processedValue.startsWith('http')) {
      processedValue = `https://www.instagram.com/${processedValue}`
    }
    
    // If the field was cleared, make sure it's empty
    if (!value.trim()) {
      processedValue = ''
    }
    
    const newData = { ...formData, [field]: processedValue }
    setFormData(newData)
    onDataChange({
      ...newData,
      opening_hours: convertToLegacyHours(openingHours)
    })
  }

  const handleHoursChange = (newSchedule: DaySchedule[]) => {
    setOpeningHours(newSchedule)
    onDataChange({
      ...formData,
      opening_hours: convertToLegacyHours(newSchedule)
    })
  }

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <ContactInfoFields
        formData={formData}
        onInputChange={handleInputChange}
        compact={true}
        className="rounded-xl bg-white border shadow-sm p-4 max-w-2xl mx-auto"
        title="Informations de contact"
        description="Adresse, téléphone, email et réseaux sociaux (optionnel)."
        primaryColor={primaryColor}
      />

      {/* Opening Hours */}
      <div className="rounded-xl bg-white border shadow-sm p-4 max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Horaires d'ouverture
          </h3>
          <p className="text-sm text-gray-600">
            Configurez vos heures d'ouverture (optionnel).
          </p>
        </div>
        <OpeningHoursInput
          schedule={openingHours}
          onChange={handleHoursChange}
          primaryColor={primaryColor}
        />
      </div>

      {/* Preview */}
      <div className="max-w-2xl mx-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Aperçu du pied de page</h4>
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 bg-gray-50">
          {/* Check if we have any info to show */}
          {(formData.address || formData.phone || formData.email || 
            (openingHours && openingHours.some(day => 
              !day.isClosed && 
              (day.firstPeriod.startHour || day.secondPeriod.startHour)
            )) ||
            formData.facebook_url || formData.instagram_url) ? (
            <EstablishmentFooter
              establishmentInfo={{
                ...formData,
                opening_hours: convertToLegacyHours(openingHours)
              }}
              color={primaryColor}
            />
          ) : (
            <div className="text-center text-gray-500">
              <h4 className="font-medium mb-2">Aperçu du pied de page</h4>
              <p className="text-sm">Remplissez les informations ci-dessus pour voir l'aperçu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Validation functions
export function validateEstablishmentInfo(data: {
  address: string
  phone: string
  email: string
  opening_hours: Array<{ day: string; hours: string }>
  facebook_url: string
  instagram_url: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate email format if provided (not required to be filled)
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push('Veuillez entrer une adresse email valide')
    }
  }

  // Validate Facebook URL format if provided (not required to be filled)
  if (data.facebook_url && data.facebook_url.trim()) {
    // Accept both full URLs and just usernames
    const facebookInput = data.facebook_url.trim()
    if (facebookInput.startsWith('http')) {
      try {
        const url = new URL(facebookInput)
        if (!url.hostname.includes('facebook.com')) {
          errors.push('Veuillez entrer une URL Facebook valide')
        }
      } catch {
        errors.push('Veuillez entrer une URL Facebook valide')
      }
    } else {
      // If it's just a username, check basic format
      const usernameRegex = /^[a-zA-Z0-9._-]+$/
      if (!usernameRegex.test(facebookInput)) {
        errors.push('Le nom de page Facebook ne peut contenir que des lettres, chiffres, points et tirets')
      }
    }
  }

  // Validate Instagram URL format if provided (not required to be filled)
  if (data.instagram_url && data.instagram_url.trim()) {
    // Accept both full URLs and just usernames
    const instagramInput = data.instagram_url.trim()
    if (instagramInput.startsWith('http')) {
      try {
        const url = new URL(instagramInput)
        if (!url.hostname.includes('instagram.com')) {
          errors.push('Veuillez entrer une URL Instagram valide')
        }
      } catch {
        errors.push('Veuillez entrer une URL Instagram valide')
      }
    } else {
      // If it's just a username, check basic format
      const usernameRegex = /^[a-zA-Z0-9._]+$/
      if (!usernameRegex.test(instagramInput)) {
        errors.push('Le nom d\'utilisateur Instagram ne peut contenir que des lettres, chiffres, points et underscores')
      }
    }
  }

  // Phone validation if provided (not required to be filled)
  if (data.phone && data.phone.trim()) {
    const phoneRegex = /^[\d\s\+\-\.\(\)]+$/
    if (!phoneRegex.test(data.phone)) {
      errors.push('Le numéro de téléphone contient des caractères invalides')
    }
  }

  // Always return valid: true if no format errors, regardless of completeness
  return {
    isValid: errors.length === 0,
    errors
  }
}
