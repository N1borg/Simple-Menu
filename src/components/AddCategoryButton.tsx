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
}

export function AddCategoryButton({ 
  onClick, 
  disabled, 
  loading, 
  className, 
  subscription 
}: AddCategoryButtonProps) {
  const isSubscriptionDisabled = subscription && !subscription.canCreateCategory
  const isDisabled = disabled || loading || isSubscriptionDisabled

  const getTooltipContent = () => {
    if (loading) return "Création en cours..."
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
      // Open upgrade dialog or mailto
      window.open(
        'mailto:contact.simplemenu@gmail.com?subject=Upgrade%20Plan&body=Je%20souhaite%20passer%20à%20un%20plan%20supérieur%20pour%20ajouter%20plus%20de%20catégories.',
        '_blank'
      )
      return
    }
    onClick()
  }

  return (
    <div className={className || "flex justify-center"}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="tutorial-add-category">
            <Button
              onClick={handleClick}
              variant="ghost"
              size="icon"
              title="Nouvelle catégorie"
              className={`bg-gray-100 hover:bg-gray-200 text-gray-600 relative ${
                isSubscriptionDisabled ? 'opacity-60 hover:opacity-80' : ''
              }`}
              disabled={disabled || loading}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isSubscriptionDisabled ? (
                  <Crown className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
