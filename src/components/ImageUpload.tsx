'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, AlertCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  slug: string
  establishmentId: string // Ajout de l'ID de l'établissement
  folder?: string
  className?: string
  color?: string
  onDeleteLogo?: () => void // Ajout de la prop optionnelle
  isDemo?: boolean // Ajout du paramètre isDemo
}

interface UploadError {
  message: string
  type: 'file' | 'network' | 'server'
}

export default function ImageUpload({ 
  onImageUploaded,
  currentImageUrl,
  establishmentId,
  folder = 'logos',
  className = '',
  color = '#3a4fff',
  onDeleteLogo,
  isDemo = false, // Ajout du paramètre isDemo
  slug,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<UploadError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add a local state for the displayed image
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | undefined>(currentImageUrl)

  // Update displayedImageUrl when currentImageUrl changes (for controlled usage)
  useEffect(() => {
    setDisplayedImageUrl(currentImageUrl)
  }, [currentImageUrl])

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const validateFile = (file: File): string | null => {
    // Check file type - be more permissive since we optimize server-side
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.'
    }

    // Remove file size limit - server will handle optimization
    // Optional: Add a very high limit to prevent abuse (e.g., 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return 'Fichier trop volumineux. Taille maximale: 50MB.'
    }

    return null
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Impossible de lire le fichier'))
      reader.readAsDataURL(file)
    })
  }

  const uploadImage = async (file: File) => {
    clearMessages()
    setIsUploading(true)

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        setError({ message: validationError, type: 'file' })
        return
      }

      // Show file size info
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      console.log(`Uploading file: ${fileSizeMB}MB`)

      // Convert to base64
      const base64 = await convertToBase64(file)

      // Upload to API
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          folder
        })
      })

      const data = await response.json()

      if (!response.ok) {
        let errorType: UploadError['type'] = 'server'
        if (response.status === 413) {
          errorType = 'file'
        } else if (response.status >= 500) {
          errorType = 'server'
        }
        setError({
          message: data.error || 'Erreur lors de l\'upload',
          type: errorType
        })
        toast.error(data.error || 'Erreur lors de l\'upload')
        return
      }
      // Success
      setSuccess('Image optimisée et uploadée avec succès!')
      toast.success('Logo mis à jour !')
      setDisplayedImageUrl(data.url) // update local display immediately
      onImageUploaded(data.url)
      setShowPopup(false) // Close the dialog after successful upload
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError({
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        type: 'network'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    uploadImage(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const getErrorColor = (type: UploadError['type']) => {
    switch (type) {
      case 'file':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-red-700 bg-red-50 border-red-200'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Centered Logo Preview (same as menu page) + Edit/Trash Buttons */}
      {displayedImageUrl && (
        <div className="relative flex justify-center mb-4">
          <div className="relative">
            <Image
              src={displayedImageUrl}
              alt="Logo actuel"
              width={160}
              height={160}
              className="w-32 h-32 rounded-full object-contain bg-white"
              priority
              quality={90}
              sizes="(max-width: 600px) 100vw, 160px"
            />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full flex flex-col gap-2 pl-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="opacity-70 hover:opacity-100" 
                    title="Modifier" 
                    onClick={() => setShowPopup(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifier le logo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ConfirmDeleteDialog
                      onConfirm={async () => {
                        setShowPopup(false)
                        if (isDemo) {
                          setDisplayedImageUrl(undefined)
                          if (onDeleteLogo) onDeleteLogo()
                          toast.success('Logo supprimé !')
                          return
                        }
                        try {
                          const res = await fetch('/api/admin/update-logo', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ slug: slug, id: establishmentId }),
                          })
                          const data = await res.json()
                          if (res.ok && data.success) {
                            setDisplayedImageUrl(undefined)
                            if (onDeleteLogo) onDeleteLogo()
                            toast.success('Logo supprimé !')
                          } else {
                            setError({ message: data.error || "Erreur lors de la suppression du logo", type: 'server' })
                            toast.error(data.error || "Erreur lors de la suppression du logo")
                          }
                        } catch (err) {
                          setError({ message: "Erreur réseau lors de la suppression du logo", type: 'network' })
                          toast.error("Erreur réseau lors de la suppression du logo")
                        }
                      }}
                      title="Confirmer la suppression"
                      description="Supprimer le logo ? Cette action est irréversible."
                      triggerButtonClassName="opacity-70 hover:opacity-100"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supprimer le logo</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
      {/* Shadcn Dialog for Upload Area */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Modifier le logo</DialogTitle>
            <DialogDescription>Optimisez et mettez à jour votre logo d'établissement.</DialogDescription>
          </DialogHeader>
          {/* Upload Area or Demo Message */}
            {isDemo ? (
            <div
              className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-center min-h-[180px] bg-blue-50 w-full"
              style={{ height: '180px', color: color }}
            >
              Vous changez votre logo ici
            </div>
            ) : (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={
                  `relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? '' : ''} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`
                }
                style={{
                  borderColor: dragActive ? color : '#d1d5db',
                  backgroundColor: dragActive ? color + '20' : undefined,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="space-y-3">
                  <Upload className={`mx-auto h-12 w-12`} style={{ color: dragActive ? color : '#9ca3af' }} />
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderColor: color }}></div>
                      <p className="text-sm text-gray-600">Optimisation et upload...</p>
                      <p className="text-xs text-gray-500">L'image est automatiquement optimisée</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium hover:underline" style={{ color }}>{'Cliquez pour sélectionner'}</span>
                        {' '}ou glissez-déposez votre image
                      </p>
                      <p className="text-xs text-gray-500">Tous formats acceptés • Optimisation automatique</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Guidelines */}
              <div className="text-xs text-gray-500 space-y-1 mt-4">
                <p>• Formats acceptés : JPEG, PNG, WebP, GIF</p>
                <p>• Taille maximale : 50MB avant optimisation</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Confirmation Pop-up for Delete */}
      {/* Si pas de logo, bouton direct */}
      {!displayedImageUrl && (
        <div className="relative flex justify-center mb-4">
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="w-32 h-32 rounded-full object-contain border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 flex flex-col items-center justify-center whitespace-normal break-words text-center leading-tight space-y-0"
                  onClick={() => setShowPopup(true)}
                >
                  <Upload className="h-5 w-5 mb-0.5" />
                  <span className="block">Ajouter un logo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ajouter un logo</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}
