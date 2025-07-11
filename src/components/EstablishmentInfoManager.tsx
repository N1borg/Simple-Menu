'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { sanitizeEmail, sanitizePhone, sanitizeText, sanitizeFacebookUrl, sanitizeInstagramUrl } from '@/lib/utils'
import { Loader2, MapPin, Mail, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"

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

interface EstablishmentInfoManagerProps {
  establishmentId: string
  slug: string
  children?: React.ReactNode
}

interface ContactFormData {
  address: string
  phone: string
  email: string
  facebook_url: string
  instagram_url: string
}

export function EstablishmentInfoManager({ establishmentId, slug, children }: EstablishmentInfoManagerProps) {
  const isDemo = slug === 'demo'
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
        instagram_url: sanitizeInstagramUrl(formData.instagram_url),
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

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      toast.success('Informations de contact mises à jour avec succès!')
      // Update initial state to reflect saved changes
      setInitialFormData(formData)
      // Close dialog by triggering a close - since we're using uncontrolled, we'll reload page
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Error saving establishment info:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Informations de contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Informations de contact</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : isDemo ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Mode Démo</p>
              <p className="text-sm text-gray-500">
                La modification des informations de contact est désactivée en mode démo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-2 mb-2 text-sm">
                <MapPin className="w-4 h-4" />
                Adresse
              </Label>
              <Input
                id="address"
                placeholder="123 Rue de la Rouge Chèvre, 59800 Lille"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                maxLength={200}
                className="text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 mb-2 text-sm">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                placeholder="01 23 45 67 89"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={20}
                className="text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@exemple.fr"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                maxLength={255}
                className="text-sm"
              />
            </div>

            {/* Facebook */}
            <div>
              <Label htmlFor="facebook" className="flex items-center gap-2 mb-2 text-sm">
                <FacebookIcon className="w-4 h-4" />
                Facebook
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">facebook.com/</span>
                </div>
                <Input
                  id="facebook"
                  placeholder="nomdelapage"
                  value={formData.facebook_url?.replace(/^https?:\/\/(www\.)?facebook\.com\//, '') || ''}
                  onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                  maxLength={50}
                  className="pl-[75px] text-sm"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2 mb-2 text-sm">
                <InstagramIcon className="w-4 h-4" />
                Instagram
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">instagram.com/</span>
                </div>
                <Input
                  id="instagram"
                  placeholder="nomdelapage"
                  value={formData.instagram_url?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '') || ''}
                  onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                  maxLength={50}
                  className="pl-[80px] text-sm"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Annuler
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || isLoading || isDemo || !hasChanges()}>
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
