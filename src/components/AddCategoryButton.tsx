import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AddCategoryButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function AddCategoryButton({ onClick, disabled, loading, className }: AddCategoryButtonProps) {
  return (
    <div className={className || "flex justify-center"}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="tutorial-add-category">
            <Button
              onClick={onClick}
              variant="ghost"
              size="icon"
              title="Nouvelle catégorie"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 relative"
              disabled={disabled || loading}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{loading ? "Création en cours..." : "Ajouter une catégorie"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
