'use client'

import { useState } from 'react'
import { defaultWeekSchedule, convertLegacyHours, convertToLegacyHours, DaySchedule } from '@/lib/utils'
import EstablishmentInfoFields, { EstablishmentFormData } from '@/components/EstablishmentInfoFields'
import EstablishmentFooter from '@/components/EstablishmentFooter'

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
  const [formData, setFormData] = useState<EstablishmentFormData>({
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

  const handleInputChange = (field: keyof EstablishmentFormData, value: string) => {
    const newData = { ...formData, [field]: value }
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
      <EstablishmentInfoFields
        formData={formData}
        openingHours={openingHours}
        onInputChange={handleInputChange}
        onHoursChange={handleHoursChange}
        compact={true}
        className="rounded-xl bg-white border shadow-sm p-4 max-w-2xl mx-auto"
        title="Informations de votre établissement"
        description="Ces informations apparaîtront dans le pied de page de votre menu (optionnel)."
        primaryColor={primaryColor}
      />

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

  // Validate email if provided
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push('Veuillez entrer une adresse email valide')
    }
  }

  // Validate URLs if provided
  if (data.facebook_url && data.facebook_url.trim()) {
    try {
      new URL(data.facebook_url)
    } catch {
      errors.push('Veuillez entrer une URL Facebook valide')
    }
  }

  if (data.instagram_url && data.instagram_url.trim()) {
    try {
      new URL(data.instagram_url)
    } catch {
      errors.push('Veuillez entrer une URL Instagram valide')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
