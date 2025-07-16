import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Crown, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import { SubscriptionLimits } from '@/hooks/useSubscription'
import { getEstablishmentColor } from '@/lib/utils'

interface SubscriptionBannerProps {
  subscription: SubscriptionLimits
  className?: string
  establishmentColor?: string | null
}

export function SubscriptionBanner({ subscription, className, establishmentColor }: SubscriptionBannerProps) {
  const { 
    plan,
    planConfig,
    categoriesUsed,
    menuItemsUsed,
    categoriesRemaining,
    menuItemsRemaining,
    canCreateCategory,
    canCreateMenuItem,
    isLoading 
  } = subscription

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </CardContent>
      </Card>
    )
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'pro':
        return <Zap className="w-4 h-4 text-blue-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getCategoryProgress = () => {
    if (planConfig.features.maxCategories === -1) return 100 // Unlimited
    return Math.min((categoriesUsed / planConfig.features.maxCategories) * 100, 100)
  }

  const getItemProgress = () => {
    if (planConfig.features.maxItems === -1) return 100 // Unlimited  
    return Math.min((menuItemsUsed / planConfig.features.maxItems) * 100, 100)
  }

  const isNearLimit = () => {
    if (planConfig.features.maxCategories !== -1 && categoriesRemaining <= 1) return true
    if (planConfig.features.maxItems !== -1 && menuItemsRemaining <= 5) return true
    return false
  }

  return (
    <Card className={`${className} ${isNearLimit() ? 'border-amber-200 bg-amber-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPlanIcon(plan)}
            <CardTitle className="text-lg">Plan {planConfig.name}</CardTitle>
            <Badge className={getPlanColor(plan)}>
              {plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Essentiel'}
            </Badge>
          </div>
          {isNearLimit() && (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <CardDescription>
          Utilisation actuelle de votre abonnement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Catégories</span>
            <span className={!canCreateCategory ? 'text-red-600 font-medium' : ''}>
              {categoriesUsed} / {planConfig.features.maxCategories === -1 ? '∞' : planConfig.features.maxCategories}
            </span>
          </div>
          <Progress 
            value={getCategoryProgress()} 
            className={`h-2 ${!canCreateCategory ? 'bg-red-100' : ''}`}
            progressColor={!canCreateCategory ? '#dc2626' : getEstablishmentColor(establishmentColor)}
          />
          {!canCreateCategory && (
            <p className="text-xs text-red-600">
              Limite atteinte. Passez à un plan supérieur pour ajouter plus de catégories.
            </p>
          )}
        </div>

        {/* Menu Items Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Éléments de menu</span>
            <span className={!canCreateMenuItem ? 'text-red-600 font-medium' : ''}>
              {menuItemsUsed} / {planConfig.features.maxItems === -1 ? '∞' : planConfig.features.maxItems}
            </span>
          </div>
          <Progress 
            value={getItemProgress()} 
            className={`h-2 ${!canCreateMenuItem ? 'bg-red-100' : ''}`}
            progressColor={!canCreateMenuItem ? '#dc2626' : getEstablishmentColor(establishmentColor)}
          />
          {!canCreateMenuItem && (
            <p className="text-xs text-red-600">
              Limite atteinte. Passez à un plan supérieur pour ajouter plus d'éléments.
            </p>
          )}
        </div>

        {/* Upgrade button for limits reached */}
        {(!canCreateCategory || !canCreateMenuItem) && plan !== 'premium' && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-2 hover:bg-opacity-10"
              style={{
                borderColor: getEstablishmentColor(establishmentColor),
                color: getEstablishmentColor(establishmentColor),
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getEstablishmentColor(establishmentColor) + '10'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={() => {
                // Open upgrade modal or redirect to pricing
                window.open('mailto:contact.simplemenu@gmail.com?subject=Upgrade%20Plan&body=Je%20souhaite%20passer%20à%20un%20plan%20supérieur.', '_blank')
              }}
            >
              <Crown className="w-4 h-4 mr-2" />
              Passer à un plan supérieur
            </Button>
          </div>
        )}

        {/* Plan features preview */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Fonctionnalités incluses :</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Support email</span>
            </div>
            {subscription.hasFeature('phoneSupport') && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Support téléphone</span>
              </div>
            )}
            {subscription.hasFeature('customBranding') && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Personnalisation</span>
              </div>
            )}
            {subscription.hasFeature('analytics') && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Statistiques</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
