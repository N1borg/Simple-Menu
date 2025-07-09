'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Palette } from 'lucide-react'
import { ColorPicker, useColor } from 'react-color-palette'
import 'react-color-palette/css'

interface ColorSelectorProps {
  currentColor?: string
  onColorChange?: (color: string) => void
  onColorSave?: (color: string) => Promise<void>
  establishmentId?: string
  isDemo?: boolean
  showPreview?: boolean
  showSaveButton?: boolean
  title?: string
  description?: string
  className?: string
}

export function ColorSelector({
  currentColor = '#3b82f6',
  onColorChange,
  onColorSave,
  establishmentId,
  isDemo = false,
  showPreview = true,
  showSaveButton = true,
  title = "Choisir une couleur",
  description = "Sélectionnez la couleur principale qui représentera votre établissement.",
  className = ""
}: ColorSelectorProps) {
  const [color, setColor] = useColor(currentColor)
  const [isLoading, setIsLoading] = useState(false)

  const handleColorChange = (newColor: any) => {
    setColor(newColor)
    if (onColorChange) {
      onColorChange(newColor.hex)
    }
  }

  const handleSaveColor = async () => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }

    if (!onColorSave) {
      return
    }

    setIsLoading(true)
    try {
      await onColorSave(color.hex)
      toast.success('Couleur mise à jour avec succès !')
    } catch (error) {
      console.error('Error saving color:', error)
      toast.error('Erreur lors de la mise à jour de la couleur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiSave = async () => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/update-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: color.hex
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la couleur')
      }

      toast.success('Couleur mise à jour avec succès !')
      
      // Optional: refresh page to see changes
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Error saving color:', error)
      toast.error('Erreur lors de la mise à jour de la couleur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Palette className="w-5 h-5" />
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-4">
        <ColorPicker 
            color={color} 
            onChange={handleColorChange}
            hideInput={['rgb', 'hsv']}
            height={200}
        />
        {showPreview && (
          <div className="w-full max-w-sm p-4 rounded-lg border" style={{ backgroundColor: color.hex + '20' }}>
            <p className="text-sm text-gray-700 mb-2">Aperçu de votre couleur</p>
            <div 
              className="h-12 rounded-lg shadow-inner" 
              style={{ backgroundColor: color.hex }}
            ></div>
            <p className="text-xs text-gray-500 mt-2 text-center font-mono">{color.hex}</p>
          </div>
        )}

        {showSaveButton && (
          <Button
            onClick={onColorSave ? handleSaveColor : handleApiSave}
            disabled={isLoading || (isDemo && !onColorSave)}
            className="w-full max-w-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder la couleur'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ColorSelector
