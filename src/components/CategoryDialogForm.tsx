import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import type { Category } from '@/types/supabase_types'
import { useState, useEffect } from 'react'
import DietaryBadge from '@/components/DietaryBadge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DISPLAY_STYLES = [
  { value: 'card', label: 'Carte' },
  { value: 'list', label: 'Liste' },
  { value: 'compact', label: 'Compact' },
  { value: 'table', label: 'Tableau' },
]

interface CategoryDialogFormProps {
  category: Category
  isDemo: boolean
  savingCategoryId: string | null
  loadingAction: string | null
  onSubmit: (updatedCategory: Category) => Promise<void>
  onDelete: () => Promise<void>
  onCancel: () => void
}

export function CategoryDialogForm({
  category,
  isDemo,
  savingCategoryId,
  loadingAction,
  onSubmit,
  onDelete,
  onCancel,
}: CategoryDialogFormProps) {
  const [localName, setLocalName] = useState(category.name)
  const [localDisplayStyle, setLocalDisplayStyle] = useState(category.display_style || 'card')
  const [localAvailable, setLocalAvailable] = useState(category.is_available ?? true)
  const [localVegan, setLocalVegan] = useState(!!category.vegan)
  const [localAlcoholFree, setLocalAlcoholFree] = useState(!!category.alcohol_free)

  useEffect(() => {
    setLocalName(category.name)
    setLocalDisplayStyle(category.display_style || 'card')
    setLocalAvailable(category.is_available ?? true)
    setLocalVegan(!!category.vegan)
    setLocalAlcoholFree(!!category.alcohol_free)
  }, [category])

  // Check if any changes were made
  const hasChanges = () => {
    return (
      localName !== category.name ||
      localDisplayStyle !== (category.display_style || 'card') ||
      localAvailable !== (category.is_available ?? true) ||
      localVegan !== !!category.vegan ||
      localAlcoholFree !== !!category.alcohol_free
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemo) {
      toast.info("Modification désactivée (mode démo).")
      return
    }

    const updatedCategory = {
      ...category,
      name: localName,
      display_style: localDisplayStyle,
      is_available: localAvailable,
      vegan: localVegan,
      alcohol_free: localAlcoholFree,
    }
    await onSubmit(updatedCategory)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <Label className="flex items-center gap-2">
          <Switch
            checked={localAvailable}
            onCheckedChange={setLocalAvailable}
            disabled={isDemo}
            className="cursor-pointer"
          />
          Disponible
        </Label>
      </div>

      <div>
        <Label>Nom de la catégorie</Label>
        <Input
          value={localName}
          onChange={e => setLocalName(e.target.value)}
          placeholder="Ex: Entrées, Plats, Desserts..."
          disabled={isDemo}
        />
      </div>
      
      <div>
        <Label>Style d'affichage</Label>
        <Select
          value={localDisplayStyle}
          onValueChange={setLocalDisplayStyle}
          disabled={isDemo}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un style" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Styles d'affichage</SelectLabel>
              {DISPLAY_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
                    title="Supprimer la catégorie ?"
                    description="Cette action supprimera la catégorie et tous ses éléments. Voulez-vous continuer ?"
                    triggerButtonClassName="mr-auto flex items-center justify-center"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer la catégorie</p>
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
              disabled={savingCategoryId === category.id || loadingAction !== null || isDemo || !hasChanges()}
              className="cursor-pointer"
            >
              {savingCategoryId === category.id ? (
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
