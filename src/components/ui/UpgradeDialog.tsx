import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Star, Check } from "lucide-react"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: string
  description?: string
}

export default function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  description = "Cette fonctionnalité est réservée aux plans Pro et Premium."
}: UpgradeDialogProps) {
  const handleUpgrade = () => {
    // Redirect to root page with hash to plans section
    window.location.href = "/#tarifs"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Passez à un plan supérieur !
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Fonctionnalités Premium
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Duplication de catégories</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Duplication d'articles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Gestion de la disponibilité des articles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Upload d'images pour les articles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Plus d'articles et catégories</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Support prioritaire</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold text-center mb-1">
              🔥 OFFRE DE LANCEMENT LIMITÉE
            </p>
            <p className="text-sm text-gray-700 text-center">
              2 semaines gratuites + 50% de réduction
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Plus tard
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Voir les plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
