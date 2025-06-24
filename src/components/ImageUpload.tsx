'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  slug: string
  folder?: string
  className?: string
  color?: string
  onDeleteLogo?: () => void // Ajout de la prop optionnelle
}

interface UploadError {
  message: string
  type: 'file' | 'network' | 'server'
}

export default function ImageUpload({ 
  onImageUploaded,
  currentImageUrl,
  folder = 'logos',
  className = '',
  color = '#3a4fff',
  onDeleteLogo,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<UploadError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        return
      }

      // Success
      setSuccess('Image optimisée et uploadée avec succès!')
      onImageUploaded(data.url)
      
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
      {currentImageUrl && (
        <div className="flex flex-col items-center justify-center mb-2 relative">
          <Image
            src={currentImageUrl}
            alt="Logo actuel"
            width={100}
            height={100}
            className="mx-auto w-25 h-25 rounded-full mb-2 shadow"
            priority
          />
          <div className="absolute top-2 right-1 flex gap-2">
            <button
              type="button"
              className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-100 focus:outline-none transition"
              aria-label="Changer le logo"
              onClick={() => setShowPopup(true)}
              style={{ color }}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full bg-white border border-red-200 shadow hover:bg-red-50 focus:outline-none text-red-600 transition"
              aria-label="Supprimer le logo"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {/* Current Image Preview (legacy, can be removed if not needed) */}
      {/* Popup for Upload Area */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-auto relative min-h-[340px] min-w-[320px] flex flex-col justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none z-10"
              aria-label="Fermer"
              onClick={() => setShowPopup(false)}
            >
              <X className="h-6 w-6" />
            </button>
            {/* Upload Area (copié depuis plus bas) */}
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
            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg border flex items-start space-x-3 mt-4 ${getErrorColor(error.type)}`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Erreur d'upload</p>
                  <p className="text-xs mt-1">{error.message}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="flex-shrink-0 opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 flex items-start space-x-3 mt-4">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Succès</p>
                  <p className="text-xs mt-1">{success}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="flex-shrink-0 opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Upload Guidelines */}
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              <p>• Formats acceptés : JPEG, PNG, WebP, GIF</p>
              <p>• Taille maximale : 50MB avant optimisation</p>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Pop-up for Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(false) }}>
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto relative flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
            <p className="text-base font-semibold text-gray-800 mb-1">Confirmer la suppression</p>
            <p className="text-sm text-gray-600 mb-4 text-center">Voulez-vous vraiment supprimer ce logo&nbsp;? Cette action est irréversible.</p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(false)}
              >Annuler</button>
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setShowPopup(false)
                  if (onDeleteLogo) onDeleteLogo()
                }}
              >Supprimer</button>
            </div>
          </div>
        </div>
      )}
      {/* Si pas de logo, bouton direct */}
      {!currentImageUrl && (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
          onClick={() => setShowPopup(true)}
        >
          <Upload className="h-5 w-5" />
          Ajouter un logo
        </button>
      )}
    </div>
  )
}
