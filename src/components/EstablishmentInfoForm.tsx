'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

// Custom SVG icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <title>Instagram</title>
    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" fill="currentColor"/>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <title>Facebook</title>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" fill="currentColor"/>
  </svg>
)

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
  initialData?: {
    address?: string
    phone?: string
    email?: string
    opening_hours?: Array<{ day: string; hours: string }>
    facebook_url?: string
    instagram_url?: string
  }
}

const defaultHours = [
  { day: 'Lun.', hours: '' },
  { day: 'Mar.', hours: '' },
  { day: 'Mer.', hours: '' },
  { day: 'Jeu.', hours: '' },
  { day: 'Ven.', hours: '' },
  { day: 'Sam.', hours: '' },
  { day: 'Dim.', hours: '' }
]

export function EstablishmentInfoForm({ 
  establishmentId, 
  onDataChange,
  initialData 
}: EstablishmentInfoFormProps) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    facebook_url: initialData?.facebook_url || '',
    instagram_url: initialData?.instagram_url || ''
  })
  const [openingHours, setOpeningHours] = useState(
    initialData?.opening_hours || defaultHours
  )

  // Update parent whenever data changes
  const updateParent = () => {
    onDataChange({
      ...formData,
      opening_hours: openingHours.filter(item => item.hours.trim() !== '')
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      // Update parent with new data
      setTimeout(() => {
        onDataChange({
          ...newData,
          opening_hours: openingHours.filter(item => item.hours.trim() !== '')
        })
      }, 0)
      return newData
    })
  }

  const handleHoursChange = (index: number, hours: string) => {
    setOpeningHours(prev => {
      const newHours = prev.map((item, i) => 
        i === index ? { ...item, hours } : item
      )
      // Update parent with new data
      setTimeout(() => {
        onDataChange({
          ...formData,
          opening_hours: newHours.filter(item => item.hours.trim() !== '')
        })
      }, 0)
      return newHours
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Informations de votre établissement
          </h3>
          <p className="text-gray-600">
            Ces informations apparaîtront dans le pied de page de votre menu (optionnel).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div className="md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Adresse
            </Label>
            <Input
              id="address"
              placeholder="101 Rue de l'Hôpital Militaire, 59000 Lille"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              Téléphone
            </Label>
            <Input
              id="phone"
              placeholder="03 21 16 29 25 ou +33 3 21 16 29 25"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@restaurant.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Facebook */}
          <div>
            <Label htmlFor="facebook" className="flex items-center gap-2 mb-2">
              <FacebookIcon className="w-4 h-4" />
              Facebook
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">facebook.com/</span>
              </div>
              <Input
                id="facebook"
                placeholder="votrepage"
                value={formData.facebook_url?.replace(/^https?:\/\/(www\.)?facebook\.com\//, '') || ''}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                maxLength={50}
                className="pl-[90px]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Entrez juste le nom de votre page
            </p>
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="flex items-center gap-2 mb-2">
              <InstagramIcon className="w-4 h-4" />
              Instagram
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">instagram.com/</span>
              </div>
              <Input
                id="instagram"
                placeholder="votrepage"
                value={formData.instagram_url?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '') || ''}
                onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                maxLength={50}
                className="pl-[95px]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Entrez juste le nom d'utilisateur
            </p>
          </div>
        </div>

        {/* Opening Hours */}
        <div>
          <Label className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" />
            Horaires d'ouverture
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {openingHours.map((item, index) => (
              <div key={item.day} className="flex items-center gap-2">
                <span className="w-12 text-sm font-medium text-gray-700">
                  {item.day}
                </span>
                <Input
                  placeholder="11:00 - 00:00 ou Fermé"
                  value={item.hours}
                  onChange={(e) => handleHoursChange(index, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Exemples: "11:00 - 23:00", "00:00 - 01:00 11:00 - 00:00", "Fermé"
          </p>
        </div>
      </div>

      {/* Preview */}
      <FooterPreview 
        establishmentInfo={{
          ...formData,
          opening_hours: openingHours.filter(item => item.hours.trim() !== '')
        }}
      />
    </div>
  )
}

// Footer Preview Component
interface FooterPreviewProps {
  establishmentInfo: {
    address: string
    phone: string
    email: string
    opening_hours: Array<{ day: string; hours: string }>
    facebook_url: string
    instagram_url: string
  }
}

function FooterPreview({ establishmentInfo }: FooterPreviewProps) {
  const hasInfo = (
    establishmentInfo.address ||
    establishmentInfo.phone ||
    establishmentInfo.email ||
    (establishmentInfo.opening_hours && establishmentInfo.opening_hours.length > 0) ||
    establishmentInfo.facebook_url ||
    establishmentInfo.instagram_url
  )

  if (!hasInfo) {
    return (
      <div className="rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="text-center text-gray-500">
          <h4 className="font-medium mb-2">Aperçu du pied de page</h4>
          <p className="text-sm">Remplissez les informations ci-dessus pour voir l'aperçu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Aperçu du pied de page</h4>
      <div 
        className="rounded-xl border-2 border-blue-200 p-4 text-blue-800"
        style={{ backgroundColor: '#f3f6fd' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Contact Information */}
          {(establishmentInfo.address || establishmentInfo.phone || establishmentInfo.email) && (
            <div>
              <h5 className="font-semibold mb-2">Nous contacter</h5>
              <div className="space-y-1">
                {establishmentInfo.address && (
                  <div className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs">{establishmentInfo.address}</span>
                  </div>
                )}
                {establishmentInfo.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs">{establishmentInfo.phone}</span>
                  </div>
                )}
                {establishmentInfo.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs">{establishmentInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {establishmentInfo.opening_hours && establishmentInfo.opening_hours.length > 0 && (
            <div>
              <h5 className="font-semibold mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Horaires
              </h5>
              <div className="space-y-0.5">
                {establishmentInfo.opening_hours.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="font-medium">{item.day}</span>
                    <span>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(establishmentInfo.facebook_url || establishmentInfo.instagram_url) && (
            <div>
              <h5 className="font-semibold mb-2">Suivez nous</h5>
              <div className="flex gap-2">
                {establishmentInfo.facebook_url && (
                  <div className="flex items-center gap-1">
                    <FacebookIcon className="w-3 h-3" />
                    <span className="text-xs">Facebook</span>
                  </div>
                )}
                {establishmentInfo.instagram_url && (
                  <div className="flex items-center gap-1">
                    <InstagramIcon className="w-3 h-3" />
                    <span className="text-xs">Instagram</span>
                  </div>
                )}
              </div>
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
