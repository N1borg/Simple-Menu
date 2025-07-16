import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
})

// Configuration des prix normaux et promotionnels
const PRICE_MAPPING = {
  essentiel: {
    promo: process.env.STRIPE_PRICE_ESSENTIEL_PROMO,
    normal: process.env.STRIPE_PRICE_ESSENTIEL
  },
  pro: {
    promo: process.env.STRIPE_PRICE_PRO_PROMO,
    normal: process.env.STRIPE_PRICE_PRO
  },
  premium: {
    promo: process.env.STRIPE_PRICE_PREMIUM_PROMO,
    normal: process.env.STRIPE_PRICE_PREMIUM
  }
}

/**
 * Gère automatiquement le passage du prix promotionnel au prix normal
 * après 3 mois de tarif réduit
 */
export async function handlePromotionEnd(subscriptionId: string, plan: string) {
  try {
    const normalPriceId = PRICE_MAPPING[plan as keyof typeof PRICE_MAPPING]?.normal
    
    if (!normalPriceId) {
      console.error(`Prix normal introuvable pour le plan ${plan}`)
      return false
    }

    // Récupérer l'abonnement actuel
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription) {
      console.error(`Abonnement ${subscriptionId} introuvable`)
      return false
    }

    // Mettre à jour l'abonnement avec le prix normal
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: normalPriceId,
      }],
      proration_behavior: 'none', // Pas de prorata, changement au prochain cycle
      metadata: {
        ...subscription.metadata,
        isPromotion: 'false',
        promotionEndedAt: new Date().toISOString()
      }
    })

    return true

  } catch (error) {
    return false
  }
}

/**
 * Vérifie si un abonnement doit passer au prix normal
 * (après 3 mois de promotion)
 */
export async function checkPromotionExpiry(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription.metadata?.isPromotion || subscription.metadata.isPromotion !== 'true') {
      return false // Pas en promotion
    }

    // Vérifier si une date de fin de promotion est définie
    if (subscription.metadata.promotionEndDate) {
      const promotionEndDate = new Date(subscription.metadata.promotionEndDate)
      const now = new Date()
      
      if (now >= promotionEndDate) {
        return true
      }
    } else {
      // Fallback: calculer si 3 mois se sont écoulés depuis le début de la facturation
      const startDate = new Date((subscription as any).current_period_start * 1000)
      const now = new Date()
      const monthsElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

      if (monthsElapsed >= 3) {
        return true
      }
    }

    return false

  } catch (error) {
    return false
  }
}

/**
 * Fonction à exécuter périodiquement (cron job) pour vérifier tous les abonnements
 */
export async function processPromotionExpirations() {
  try {
    // Récupérer tous les abonnements actifs avec promotion
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    })

    let processedCount = 0

    for (const subscription of subscriptions.data) {
      if (subscription.metadata?.isPromotion === 'true') {
        const shouldExpire = await checkPromotionExpiry(subscription.id)
        
        if (shouldExpire) {
          const plan = subscription.metadata.plan
          const success = await handlePromotionEnd(subscription.id, plan)
          
          if (success) {
            processedCount++
          }
        }
      }
    }

    return processedCount

  } catch (error) {
    return 0
  }
}
