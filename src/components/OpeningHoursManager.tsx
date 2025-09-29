'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { defaultWeekSchedule, convertLegacyHours, convertToLegacyHours, DaySchedule, getEstablishmentColor } from '@/lib/utils'
import { Loader2, Clock } from 'lucide-react'
import OpeningHoursInput from '@/components/OpeningHoursInput'
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

interface OpeningHoursManagerProps {
  slug: string
  children?: React.ReactNode
  primaryColor?: string
  isDemo?: boolean
  openingHoursData?: any // Accept opening_hours directly
}

const defaultHours = defaultWeekSchedule

export function OpeningHoursManager({ slug, children, primaryColor, isDemo = false, openingHoursData }: OpeningHoursManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const initialHours = openingHoursData ? convertLegacyHours(openingHoursData) : defaultHours
  const [openingHours, setOpeningHours] = useState<DaySchedule[]>(initialHours)
  const [initialOpeningHours, setInitialOpeningHours] = useState<DaySchedule[]>(initialHours)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Check if there are any changes
  const hasChanges = () => {
    return JSON.stringify(convertToLegacyHours(openingHours)) !== JSON.stringify(convertToLegacyHours(initialOpeningHours))
  }

  // No API call for loading opening hours; use prop

  const handleHoursChange = (newSchedule: DaySchedule[]) => {
    setOpeningHours(newSchedule)
  }

  const handleSave = async () => {
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/establishment-info/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opening_hours: convertToLegacyHours(openingHours)
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      toast.success('Horaires mis à jour avec succès!')
      // Update initial state to reflect saved changes
      setInitialOpeningHours(openingHours)
      setDialogOpen(false)
    } catch (error) {
      console.error('Error saving opening hours:', error)
      // Keep the user's edits - don't revert opening hours on error
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            style={{ 
              borderColor: getEstablishmentColor(primaryColor), 
              color: getEstablishmentColor(primaryColor) 
            }}
            onClick={() => setDialogOpen(true)}
          >
            <Clock 
              className="w-4 h-4" 
              style={{ color: getEstablishmentColor(primaryColor) }}
            />
            Horaires d'ouverture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle 
            className="text-lg"
            style={{ color: getEstablishmentColor(primaryColor) }}
          >
            Horaires d'ouverture
          </DialogTitle>
          <DialogDescription>
            Configurez les heures d'ouverture de votre établissement.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <OpeningHoursInput
              schedule={openingHours}
              onChange={handleHoursChange}
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
