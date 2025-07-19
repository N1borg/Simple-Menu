import DietaryBadge from '@/components/DietaryBadge'
import type { Category } from '@/types/supabase_types'

interface BadgeLegendProps {
  categories: Category[]
  className?: string
}

export default function BadgeLegend({ categories, className = '' }: BadgeLegendProps) {
  // Helper function to check dietary attributes for a category
  const getCategoryDietaryAttributes = (category: Category) => {
    // Check if attributes are explicitly set on the category
    const categoryVegan = !!category.vegan
    const categoryAlcoholFree = !!category.alcohol_free
    
    // Check if all available items have the same attributes (for automatic badges)
    const availableItems = category.menu_items?.filter(item => item.is_available) || []
    const allVegan = availableItems.length > 0 && availableItems.every(item => item.vegan)
    const allAlcoholFree = availableItems.length > 0 && availableItems.every(item => item.alcohol_free)
    
    // Return true if explicitly set OR if all available items have it
    return { 
      vegan: categoryVegan || allVegan, 
      alcoholFree: categoryAlcoholFree || allAlcoholFree 
    }
  }

  // Collect all badges used in the menu
  const usedBadges = new Set<string>()
  
  categories.forEach(category => {
    if (category.is_available !== false) {
      // Check category-level badges
      const categoryDietary = getCategoryDietaryAttributes(category)
      if (categoryDietary.vegan) usedBadges.add('vegan')
      if (categoryDietary.alcoholFree) usedBadges.add('alcohol-free')
      
      // Check item-level badges (only if not already covered by category)
      category.menu_items?.forEach(item => {
        if (item.is_available && !categoryDietary.vegan && item.vegan) {
          usedBadges.add('vegan')
        }
        if (item.is_available && !categoryDietary.alcoholFree && item.alcohol_free) {
          usedBadges.add('alcohol-free')
        }
      })
    }
  })

  // If no badges are used, don't show the legend
  if (usedBadges.size === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 text-center">Légende</h3>
      <div className="space-y-1">
        {usedBadges.has('vegan') && (
          <div className="flex items-center gap-2">
            <DietaryBadge type="vegan" size="sm" showText={true} />
            <span className="text-xs text-gray-500">Plat sans ingrédients d'origine animale</span>
          </div>
        )}
        {usedBadges.has('alcohol-free') && (
          <div className="flex items-center gap-2">
            <DietaryBadge type="alcohol-free" size="sm" showText={true} />
            <span className="text-xs text-gray-500">Boisson sans alcool</span>
          </div>
        )}
      </div>
    </div>
  )
} 