// Promotional pricing configuration
// This allows easy management of promotional offers

export interface PromotionalOffer {
  id: string
  name: string
  description: string
  discountPercentage: number
  isActive: boolean
  validFrom: Date
  validUntil: Date
  freeTrialMonths: number
  promotionalMonths: number
}

// Current promotional offer configuration
export const CURRENT_PROMOTION: PromotionalOffer = {
  id: 'launch-offer-2025',
  name: 'Offre de lancement',
  description: '2 semaines gratuites + 50% de réduction sur les 3 premiers mois',
  discountPercentage: 50,
  isActive: true,
  validFrom: new Date('2025-01-01'),
  validUntil: new Date('2025-12-31'), // Easy to modify when promotion ends
  freeTrialMonths: 1,
  promotionalMonths: 3
}

// Helper functions for promotional pricing
export const isPromotionActive = (): boolean => {
  const now = new Date()
  return CURRENT_PROMOTION.isActive && 
         now >= CURRENT_PROMOTION.validFrom && 
         now <= CURRENT_PROMOTION.validUntil
}

export const getPromotionalPrice = (originalPrice: number): number => {
  if (!isPromotionActive()) return originalPrice
  return Math.round(originalPrice * (1 - CURRENT_PROMOTION.discountPercentage / 100))
}

export const getPromotionBadgeText = (): string | null => {
  if (!isPromotionActive()) return null
  return `${CURRENT_PROMOTION.freeTrialMonths} mois gratuit + -${CURRENT_PROMOTION.discountPercentage}% les ${CURRENT_PROMOTION.promotionalMonths} premiers mois`
}

export const getPromotionBannerText = (): string | null => {
  if (!isPromotionActive()) return null
  return `🔥 ${CURRENT_PROMOTION.name.toUpperCase()} : ${CURRENT_PROMOTION.description} !`
}

// Easy way to disable the promotion
export const disablePromotion = (): void => {
  CURRENT_PROMOTION.isActive = false
}

// Easy way to extend the promotion
export const extendPromotion = (newEndDate: Date): void => {
  CURRENT_PROMOTION.validUntil = newEndDate
}

export default CURRENT_PROMOTION
