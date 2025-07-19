import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import type { MenuItem } from '@/types/supabase_types'
import { useState, useEffect } from 'react'
import DietaryBadge from '@/components/DietaryBadge'

interface MenuItemDialogFormProps {
  item: MenuItem
  isDemo: boolean
  savingItemId: string | null
  loadingAction: string | null
  onSubmit: (updatedItem: MenuItem) => Promise<void>
  onDelete: () => Promise<void>
  onCancel: () => void
}

export function MenuItemDialogForm({
  item,
  isDemo,
  savingItemId,
  loadingAction,
  onSubmit,
  onDelete,
  onCancel,
}: MenuItemDialogFormProps) {
  const [localName, setLocalName] = useState(item.name)
  const [localDescription, setLocalDescription] = useState(item.description || '')
  const [localPrice, setLocalPrice] = useState(item.price_one?.toFixed(2) ?? '')
  const [localAvailable, setLocalAvailable] = useState(!!item.is_available)
  const [localVegan, setLocalVegan] = useState(!!item.vegan)
  const [localAlcoholFree, setLocalAlcoholFree] = useState(!!item.alcohol_free)

  useEffect(() => {
    setLocalName(item.name)
    setLocalDescription(item.description || '')
    setLocalPrice(item.price_one?.toFixed(2) ?? '')
    setLocalAvailable(!!item.is_available)
    setLocalVegan(!!item.vegan)
    setLocalAlcoholFree(!!item.alcohol_free)
  }, [item])

  // Check if any changes were made
  const hasChanges = () => {
    const currentPrice = parseFloat(localPrice.replace(',', '.')) || 0
    const originalPrice = item.price_one || 0

    return (
      localName !== item.name ||
      localDescription !== (item.description || '') ||
      Math.abs(currentPrice - originalPrice) > 0.01 || // Allow for floating point precision
      localAvailable !== !!item.is_available ||
      localVegan !== !!item.vegan ||
      localAlcoholFree !== !!item.alcohol_free
    )
  }

  const handleAvailableChange = (val: boolean) => {
    setLocalAvailable(val)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }
    let parsedPrice = parseFloat(localPrice.replace(',', '.'))
    if (isNaN(parsedPrice)) parsedPrice = 0
    const updatedItem = {
      ...item,
      name: localName,
      description: localDescription,
      price_one: parsedPrice,
      is_available: localAvailable,
      vegan: localVegan,
      alcohol_free: localAlcoholFree,
    }
    await onSubmit(updatedItem)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-3">
      <div>
        <Label className="flex items-center gap-2">
          <Switch
            checked={localAvailable}
            onCheckedChange={handleAvailableChange}
            className="cursor-pointer"
            disabled={isDemo}
          />
          Disponible
        </Label>
      </div>

      <div>
        <Label>Nom</Label>
        <Input
          value={localName}
          onChange={e => setLocalName(e.target.value)}
          placeholder="Nom de l'article"
          disabled={isDemo}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={localDescription}
          onChange={e => setLocalDescription(e.target.value)}
          placeholder="Description détaillée de l'article"
          disabled={isDemo}
        />
      </div>
      <div>
        <Label>Prix</Label>
        <Input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={localPrice}
          placeholder="0.00"
          onChange={e => {
            const val = e.target.value.replace(/[^0-9.,]/g, '')
            setLocalPrice(val)
          }}
          disabled={isDemo}
        />
      </div>
      <div>
        <Label>Badges alimentaires</Label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setLocalVegan(!localVegan)}
            disabled={isDemo}
            className="cursor-pointer"
          >
            <DietaryBadge 
              type="vegan" 
              variant={localVegan ? "active" : "inactive"}
            />
          </button>
          <button
            type="button"
            onClick={() => setLocalAlcoholFree(!localAlcoholFree)}
            disabled={isDemo}
            className="cursor-pointer"
          >
            <DietaryBadge 
              type="alcohol-free" 
              variant={localAlcoholFree ? "active" : "inactive"}
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Cliquez sur les badges pour les activer/désactiver
        </p>
      </div>
      <DialogFooter>
        <div className="flex w-full justify-between gap-2">
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <ConfirmDeleteDialog
                    onConfirm={onDelete}
                    title="Supprimer l'élément ?"
                    description="Cette action supprimera cet élément du menu. Voulez-vous continuer ?"
                    triggerButtonClassName="mr-auto flex items-center justify-center"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer l'élément</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="cursor-pointer"
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={savingItemId === item.id || loadingAction !== null || isDemo || !hasChanges()}
              className="cursor-pointer"
            >
              {savingItemId === item.id ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  Enregistrement...
                </div>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  )
}
