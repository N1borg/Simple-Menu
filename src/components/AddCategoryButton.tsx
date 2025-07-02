import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AddCategoryButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function AddCategoryButton({ onClick, disabled, className }: AddCategoryButtonProps) {
  return (
    <div className={className || "flex justify-center"}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="ghost"
            size="icon"
            title="Nouvelle catégorie"
            className="bg-gray-100 hover:bg-gray-200 text-gray-600"
            disabled={disabled}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ajouter une catégorie</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
