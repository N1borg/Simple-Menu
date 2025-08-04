import type { Category } from '@/types/supabase_types'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Crown, Loader2 } from "lucide-react"
import { getEstablishmentColor } from '@/lib/utils'

interface AddItemGhostProps {
  category: Category
  displayStyle: string
  onAddItem: () => void
  loading: boolean
  canCreateMenuItem: boolean
  limitInfo?: {
    current: number
    max: number
    planName: string
  }
  establishmentColor?: string
  onUpgradeNeeded?: () => void
}

export default function AddItemGhost({
  category,
  displayStyle,
  onAddItem,
  loading,
  canCreateMenuItem,
  limitInfo,
  establishmentColor,
  onUpgradeNeeded
}: AddItemGhostProps) {
  const ringColor = getEstablishmentColor(establishmentColor)

  const renderGhostCard = () => (
    <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center transition min-h-[8em] hover:bg-gray-200 cursor-pointer group">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
      ) : !canCreateMenuItem ? (
        <Crown className="w-4 h-4 text-gray-600" />
      ) : (
        <Plus className="w-4 h-4 text-gray-600" />
      )}
    </div>
  )

  const renderGhostCompact = () => (
    <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-center cursor-pointer min-h-[4.75em] hover:bg-gray-200 group">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
      ) : !canCreateMenuItem ? (
        <Crown className="w-4 h-4 text-gray-600" />
      ) : (
        <Plus className="w-4 h-4 text-gray-600" />
      )}
    </div>
  )

  const renderGhostList = () => (
    <div className="flex items-center justify-center p-4 rounded-xl bg-gray-100 min-h-21 mb-3 hover:bg-gray-200 cursor-pointer group">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
      ) : !canCreateMenuItem ? (
        <Crown className="w-4 h-4 text-gray-600" />
      ) : (
        <Plus className="w-4 h-4 text-gray-600" />
      )}
    </div>
  )

  const handleClick = () => {
    if (!loading) {
      if (canCreateMenuItem) {
        onAddItem()
      } else if (onUpgradeNeeded) {
        onUpgradeNeeded()
      }
    }
  }

  const tooltipContent = loading ? (
    <p>Ajout en cours...</p>
  ) : !canCreateMenuItem ? (
    <div className="text-center">
      <p className="mb-1">Limite d'éléments atteinte</p>
      {limitInfo && (
        <>
          <p className="text-xs">({limitInfo.current}/{limitInfo.max} éléments - {limitInfo.planName})</p>
          <p className="text-xs text-blue-200 mt-1">Passez à un plan supérieur</p>
        </>
      )}
    </div>
  ) : (
    <p>Ajouter un élément</p>
  )

  const ghostElement = displayStyle === "compact" ? renderGhostCompact() :
                     displayStyle === "list" ? renderGhostList() :
                     renderGhostCard()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          onClick={handleClick}
          className={!loading ? "cursor-pointer" : "cursor-not-allowed"}
        >
          {ghostElement}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  )
}
