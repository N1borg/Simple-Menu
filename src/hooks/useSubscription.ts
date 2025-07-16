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

export function useSubscription(establishment: EstablishmentWithCategories): SubscriptionLimits {
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

  useEffect(() => {
    async function fetchLimits() {
      try {
        setLimits(prev => ({ ...prev, isLoading: true, error: null }))

        // Handle demo case without API call (no authentication available)
        if (establishment.slug === 'demo') {
          const plan = 'pro' // Demo always shows pro features
          const planConfig = SUBSCRIPTION_PLANS[plan]
          
          setLimits({
            plan,
            planConfig,
            categoriesUsed: 5,
            menuItemsUsed: 25,
            categoriesRemaining: 10,
            menuItemsRemaining: 175,
            canCreateCategory: true,
            canCreateMenuItem: true,
            hasFeature: (feature: string) => {
              return SubscriptionService.hasFeature(plan, feature as any)
            },
            isLoading: false,
            error: null,
          })
          return
        }

        const response = await fetch('/api/admin/subscription/limits')
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription limits')
        }

        const data = await response.json()
        
        const plan = data.plan || establishment.plan || 'essentiel'
        const planConfig = SUBSCRIPTION_PLANS[plan]
        
        if (!planConfig) {
          throw new Error(`Unknown plan: ${plan}`)
        }

        const categoriesUsed = data.usage?.categoriesUsed || establishment.categories?.length || 0
        const menuItemsUsed = data.usage?.menuItemsUsed || 
          establishment.categories?.reduce((total, cat) => total + (cat.menu_items?.length || 0), 0) || 0

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

      } catch (error) {
        console.error('Error fetching subscription limits:', error)
        
        // Fallback to client-side calculation with establishment data
        const plan = establishment.plan || 'essentiel'
        const planConfig = SUBSCRIPTION_PLANS[plan]
        
        if (planConfig) {
          const categoriesUsed = establishment.categories?.length || 0
          const menuItemsUsed = establishment.categories?.reduce((total, cat) => total + (cat.menu_items?.length || 0), 0) || 0
          
          const maxCategories = planConfig.features.maxCategories
          const maxItems = planConfig.features.maxItems
          
          const categoriesRemaining = maxCategories === -1 ? -1 : Math.max(0, maxCategories - categoriesUsed)
          const menuItemsRemaining = maxItems === -1 ? -1 : Math.max(0, maxItems - menuItemsUsed)
          
          setLimits({
            plan,
            planConfig,
            categoriesUsed,
            menuItemsUsed,
            categoriesRemaining,
            menuItemsRemaining,
            canCreateCategory: maxCategories === -1 || categoriesUsed < maxCategories,
            canCreateMenuItem: maxItems === -1 || menuItemsUsed < maxItems,
            hasFeature: (feature: string) => {
              return SubscriptionService.hasFeature(plan, feature as any)
            },
            isLoading: false,
            error: 'Unable to fetch latest limits, using cached data',
          })
        } else {
          setLimits(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }))
        }
      }
    }

    fetchLimits()
  }, [establishment])

  return limits
}
