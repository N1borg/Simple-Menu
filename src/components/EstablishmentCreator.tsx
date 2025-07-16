'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Building2, Mail, Key, CheckCircle2, ExternalLink, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface NewEstablishment {
  id: string
  name: string
  slug: string
  email: string
  setupUrl: string
  adminUrl: string
}

interface EstablishmentCreatorProps {
  onEstablishmentCreated?: (establishment: NewEstablishment) => void
}

export function EstablishmentCreator({ onEstablishmentCreated }: EstablishmentCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    adminKey: ''
  })
  const [createdEstablishment, setCreatedEstablishment] = useState<NewEstablishment | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.contactEmail.trim() || !formData.adminKey.trim()) {
      toast.error('Tous les champs sont requis')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/establishment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactEmail: formData.contactEmail.trim(),
          adminKey: formData.adminKey.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      // Success
      setCreatedEstablishment(data.establishment)
      setFormData({ name: '', contactEmail: '', adminKey: '' })
      toast.success('Établissement créé avec succès ! Email envoyé.')
      
      if (onEstablishmentCreated) {
        onEstablishmentCreated(data.establishment)
      }

    } catch (error) {
      console.error('Error creating establishment:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copié dans le presse-papier`)
    } catch (error) {
      toast.error('Erreur lors de la copie')
    }
  }

  const resetDialog = () => {
    setCreatedEstablishment(null)
    setFormData({ name: '', contactEmail: '', adminKey: '' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        resetDialog()
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Building2 className="w-4 h-4" />
          Créer un nouvel établissement
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {createdEstablishment ? 'Établissement créé avec succès' : 'Créer un nouvel établissement'}
          </DialogTitle>
        </DialogHeader>

        {createdEstablishment ? (
          // Success view
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Établissement créé avec succès !</h3>
                <p className="text-sm text-green-700">
                  Un email avec les identifiants de connexion a été envoyé à {createdEstablishment.email}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{createdEstablishment.name}</CardTitle>
                <CardDescription>Informations de l'établissement créé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Identifiant (slug)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={createdEstablishment.slug}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdEstablishment.slug, 'Identifiant')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email de contact</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={createdEstablishment.email}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdEstablishment.email, 'Email')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">URL de configuration</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={createdEstablishment.setupUrl}
                        readOnly
                        className="bg-gray-50 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdEstablishment.setupUrl, 'URL de configuration')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(createdEstablishment.setupUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">URL d'administration</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={createdEstablishment.adminUrl}
                        readOnly
                        className="bg-gray-50 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdEstablishment.adminUrl, 'URL d\'administration')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(createdEstablishment.adminUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📧 Email automatique envoyé</h4>
                  <p className="text-sm text-blue-700">
                    Le client recevra automatiquement un email contenant :
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Son identifiant de connexion</li>
                    <li>• Son mot de passe temporaire</li>
                    <li>• Le lien de configuration</li>
                    <li>• Les instructions de première connexion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={() => resetDialog()}
                className="flex-1"
              >
                Créer un autre établissement
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          // Creation form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nom de l'établissement *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Restaurant Le Bistrot"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-600">
                  Le nom complet de l'établissement (sera utilisé pour générer l'identifiant)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email de contact *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@restaurant.fr"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-600">
                  Email où seront envoyés les identifiants de connexion
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminKey" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Clé d'administration *
                </Label>
                <Input
                  id="adminKey"
                  type="password"
                  placeholder="Clé secrète d'administration"
                  value={formData.adminKey}
                  onChange={(e) => handleInputChange('adminKey', e.target.value)}
                  required
                />
                <p className="text-xs text-gray-600">
                  Clé secrète requise pour créer de nouveaux établissements
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">🔐 Processus automatisé</h4>
              <p className="text-sm text-yellow-700">
                Après la création, le client recevra automatiquement par email :
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Son identifiant unique de connexion</li>
                <li>• Un mot de passe temporaire sécurisé</li>
                <li>• Le lien direct pour configurer son menu</li>
                <li>• Les instructions étape par étape</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création en cours...
                  </div>
                ) : (
                  'Créer l\'établissement'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
