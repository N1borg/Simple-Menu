'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  slug: string
  folder?: string
  className?: string
  color?: string
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
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<UploadError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
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
      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Image 
            src={currentImageUrl} 
            alt="Logo actuel" 
            width={100}
            height={100}
            className="w-25 h-25 object-cover rounded"
            priority
          />
          <span className="text-sm text-gray-600">Logo actuel</span>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={
          `
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? '' 
            : ''
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `
        }
        style={{
          borderColor: dragActive ? color : '#d1d5db', // blue-400 or gray-300
          backgroundColor: dragActive ? color + '20' : undefined, // 20 = ~12% opacity
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
              <p className="text-xs text-gray-500">
                L'image est automatiquement optimisée
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium hover:underline" style={{ color }}>{'Cliquez pour sélectionner'}</span>
                {' '}ou glissez-déposez votre image
              </p>
              <p className="text-xs text-gray-500">
                Tous formats acceptés • Optimisation automatique
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-3 rounded-lg border flex items-start space-x-3 ${getErrorColor(error.type)}`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Erreur d'upload
            </p>
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
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 flex items-start space-x-3">
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
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formats acceptés : JPEG, PNG, WebP, GIF</p>
        <p>• Taille maximale : 50MB avant optimisation</p>
      </div>
    </div>
  )
}
