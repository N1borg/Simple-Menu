import { useState } from "react"
import UpgradeDialog from "@/components/ui/UpgradeDialog"
import { Plus, Loader2, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SubscriptionLimits } from "@/hooks/useSubscription"

interface AddCategoryButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  subscription?: SubscriptionLimits
  isAddingItemGlobally?: boolean
}

export function AddCategoryButton({ 
  onClick, 
  disabled, 
  loading, 
  className, 
  subscription,
  isAddingItemGlobally = false
}: AddCategoryButtonProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const isSubscriptionDisabled = subscription && !subscription.canCreateCategory

  const getTooltipContent = () => {
    if (loading || isAddingItemGlobally) return "Création en cours..."
    if (isSubscriptionDisabled && subscription) {
      const maxCategories = subscription.planConfig?.features.maxCategories
      return (
        <div className="text-center">
          <p className="mb-1">Limite de catégories atteinte</p>
          <p className="text-xs">({maxCategories} max pour le plan {subscription.planConfig?.name})</p>
          <p className="text-xs text-blue-200 mt-1">Passez à un plan supérieur</p>
        </div>
      )
    }
    return "Ajouter une catégorie"
  }

  const handleClick = () => {
    if (isSubscriptionDisabled && subscription) {
      setUpgradeDialogOpen(true)
      return
    }
    onClick()
  }

  return (
    <div className={className || "flex justify-center"}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            variant="ghost"
            size="icon"
            title="Nouvelle catégorie"
            className={`bg-gray-100 hover:bg-gray-200 text-gray-600 relative ${
              isSubscriptionDisabled ? 'opacity-60 hover:opacity-80' : ''
            }`}
            disabled={disabled || loading || isAddingItemGlobally}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {(loading || isAddingItemGlobally) ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isSubscriptionDisabled ? (
                <Crown className="w-6 h-6" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        feature="Limite de catégories atteinte"
        description={
          subscription && subscription.planConfig
            ? `Vous avez atteint la limite de ${subscription.planConfig.features.maxCategories} catégories pour le plan ${subscription.planConfig.name}. Passez à un plan supérieur pour en ajouter plus.`
            : "Vous avez atteint la limite de catégories pour votre plan. Passez à un plan supérieur pour en ajouter plus."
        }
      />
    </div>
  )
}
