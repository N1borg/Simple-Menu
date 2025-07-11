'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { defaultWeekSchedule, convertLegacyHours, convertToLegacyHours, DaySchedule } from '@/lib/utils'
import { Loader2, Clock } from 'lucide-react'
import OpeningHoursInput from '@/components/OpeningHoursInput'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"

interface OpeningHoursManagerProps {
  establishmentId: string
  slug: string
  children?: React.ReactNode
}

const defaultHours = defaultWeekSchedule

export function OpeningHoursManager({ establishmentId, slug, children }: OpeningHoursManagerProps) {
  const isDemo = slug === 'demo'
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [openingHours, setOpeningHours] = useState<DaySchedule[]>(defaultHours)
  const [initialOpeningHours, setInitialOpeningHours] = useState<DaySchedule[]>(defaultHours)

  // Check if there are any changes
  const hasChanges = () => {
    return JSON.stringify(convertToLegacyHours(openingHours)) !== JSON.stringify(convertToLegacyHours(initialOpeningHours))
  }

  // Load establishment data on mount for non-demo
  useEffect(() => {
    if (!isDemo) {
      loadOpeningHours()
    }
  }, [isDemo])

  const loadOpeningHours = async () => {
    if (isDemo) {
      return // Don't load data in demo mode
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/establishment-info?slug=${slug}`)
      if (response.ok) {
        const data = await response.json()
        const loadedHours = data.opening_hours ? convertLegacyHours(data.opening_hours) : defaultHours
        
        setOpeningHours(loadedHours)
        setInitialOpeningHours(loadedHours)
      } else {
        toast.error('Erreur lors du chargement des horaires')
      }
    } catch (error) {
      console.error('Error loading opening hours:', error)
      toast.error('Erreur lors du chargement des horaires')
    } finally {
      setIsLoading(false)
    }
  }

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
      // Close dialog by triggering a close - since we're using uncontrolled, we'll reload page
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Error saving opening hours:', error)
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
            <Clock className="w-4 h-4" />
            Horaires d'ouverture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Horaires d'ouverture</DialogTitle>
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
                La modification des horaires est désactivée en mode démo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <OpeningHoursInput
              schedule={openingHours}
              onChange={handleHoursChange}
            />
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
