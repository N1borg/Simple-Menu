import { useState, useEffect } from 'react'
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/subscription'
import type { EstablishmentWithCategories } from '@/types/supabase_types'

export interface SubscriptionLimits {
  plan: string
  planConfig: any
  categoriesUsed: number
  menuItemsUsed: number
  categoriesRemaining: number
  menuItemsRemaining: number
  canCreateCategory: boolean
  canCreateMenuItem: boolean
  hasFeature: (feature: string) => boolean
  isLoading: boolean
  error: string | null
}

export function useSubscription(establishment: EstablishmentWithCategories, currentCategories?: any[]): SubscriptionLimits {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    plan: establishment.plan || 'essentiel',
    planConfig: SUBSCRIPTION_PLANS[establishment.plan || 'essentiel'],
    categoriesUsed: 0,
    menuItemsUsed: 0,
    categoriesRemaining: 0,
    menuItemsRemaining: 0,
    canCreateCategory: false,
    canCreateMenuItem: false,
    hasFeature: () => false,
    isLoading: true,
    error: null,
  })

  // Helper function to count real items (excluding temporary/loading items)
  const countRealCategories = (categories: any[]) => {
    return categories.filter(cat => !cat.id?.startsWith('temp-') && !cat.isLoading).length
  }

  const countRealMenuItems = (categories: any[]) => {
    return categories.reduce((total, cat) => {
      if (cat.id?.startsWith('temp-') || cat.isLoading) return total
      const realItems = (cat.menu_items || []).filter((item: any) => !item.id?.startsWith('temp-') && !item.isLoading)
      return total + realItems.length
    }, 0)
  }

  useEffect(() => {
    function calculateLimits() {
      const plan = establishment.plan || 'essentiel'
      const planConfig = SUBSCRIPTION_PLANS[plan]
      
      if (!planConfig) {
        setLimits(prev => ({
          ...prev,
          isLoading: false,
          error: `Unknown plan: ${plan}`,
        }))
        return
      }

      // Use current categories if available, otherwise fallback to establishment data
      const categories = currentCategories || establishment.categories || []
      const categoriesUsed = countRealCategories(categories)
      const menuItemsUsed = countRealMenuItems(categories)

      const maxCategories = planConfig.features.maxCategories
      const maxItems = planConfig.features.maxItems

      const categoriesRemaining = maxCategories === -1 ? -1 : Math.max(0, maxCategories - categoriesUsed)
      const menuItemsRemaining = maxItems === -1 ? -1 : Math.max(0, maxItems - menuItemsUsed)

      const canCreateCategory = maxCategories === -1 || categoriesUsed < maxCategories
      const canCreateMenuItem = maxItems === -1 || menuItemsUsed < maxItems

      setLimits({
        plan,
        planConfig,
        categoriesUsed,
        menuItemsUsed,
        categoriesRemaining,
        menuItemsRemaining,
        canCreateCategory,
        canCreateMenuItem,
        hasFeature: (feature: string) => {
          return SubscriptionService.hasFeature(plan, feature as any)
        },
        isLoading: false,
        error: null,
      })
    }

    calculateLimits()
  }, [establishment, currentCategories])

  return limits
}
