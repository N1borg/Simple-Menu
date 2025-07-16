import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
})

// Plan pricing configuration avec offre de lancement
const PLAN_PRICING = {
  essentiel: {
    originalPrice: 1399, // 13,99€ in cents
    promoPrice: 699,     // 6,99€ in cents (-50%)
    stripePriceId: process.env.STRIPE_PRICE_ESSENTIEL,
    stripePromoPriceId: process.env.STRIPE_PRICE_ESSENTIEL_PROMO,
    trialDays: 14 // 2 semaines d'essai gratuit
  },
  pro: {
    originalPrice: 2599, // 25,99€ in cents
    promoPrice: 1299,    // 12,99€ in cents (-50%)
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    stripePromoPriceId: process.env.STRIPE_PRICE_PRO_PROMO,
    trialDays: 14 // 2 semaines d'essai gratuit
  },
  premium: {
    originalPrice: 3999, // 39,99€ in cents
    promoPrice: 1999,    // 19,99€ in cents (-50%)
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
    stripePromoPriceId: process.env.STRIPE_PRICE_PREMIUM_PROMO,
    trialDays: 14 // 2 semaines d'essai gratuit
  }
}

interface CreateCheckoutSessionParams {
  plan: 'essentiel' | 'pro' | 'premium'
  customerEmail: string
  customerName: string
  customerPhone?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string> // For storing establishment data
}

export async function createStripeCheckoutSession({
  plan,
  customerEmail,
  customerName,
  customerPhone,
  successUrl,
  cancelUrl,
  metadata = {}
}: CreateCheckoutSessionParams): Promise<{
  success: boolean
  checkoutUrl?: string
  sessionId?: string
  error?: string
}> {
  try {
    const planConfig = PLAN_PRICING[plan]
    
    if (!planConfig || !planConfig.stripePromoPriceId) {
      return {
        success: false,
        error: `Configuration de prix manquante pour le plan ${plan}`
      }
    }

    // Create customer first
    let customer
    try {
      const customerData: Stripe.CustomerCreateParams = {
        email: customerEmail,
        name: customerName,
        metadata: {
          plan,
          ...metadata // Include all establishment data
        }
      }
      
      // Add phone if provided and format it properly
      if (customerPhone) {
        // Ensure phone starts with + for international format
        let formattedPhone = customerPhone.trim()
        if (!formattedPhone.startsWith('+')) {
          // Assume French number if no country code
          formattedPhone = '+33' + formattedPhone.replace(/^0/, '')
        }
        customerData.phone = formattedPhone
        console.log('Setting customer phone:', formattedPhone)
      }
      
      customer = await stripe.customers.create(customerData)
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      return {
        success: false,
        error: 'Erreur lors de la création du client'
      }
    }

    // Create checkout session with promotional pricing and trial
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.stripePromoPriceId,
          quantity: 1,
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        plan,
        isPromotion: 'true',
        ...metadata // Include all establishment data
      },
      subscription_data: {
        metadata: {
          plan,
          isPromotion: 'true',
          promotionEndDate: (() => {
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + 3) // 3 months from now
            return endDate.toISOString()
          })(),
          ...metadata // Include all establishment data
        },
        trial_period_days: planConfig.trialDays, // 2 semaines d'essai gratuit
      },
      allow_promotion_codes: false, // We handle the promotion internally
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      // Add customer billing information
      customer_update: {
        name: 'auto',
        address: 'auto'
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      success: true,
      checkoutUrl: session.url || undefined,
      sessionId: session.id
    }

  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe inconnue'
    }
  }
}

export async function createStripePortalSession(
  customerId: string,
  returnUrl: string
): Promise<{
  success: boolean
  portalUrl?: string
  error?: string
}> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return {
      success: true,
      portalUrl: session.url
    }
  } catch (error) {
    console.error('Stripe portal session creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe inconnue'
    }
  }
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlan: 'essentiel' | 'pro' | 'premium'
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const planConfig = PLAN_PRICING[newPlan]
    
    if (!planConfig || !planConfig.stripePriceId) {
      return {
        success: false,
        error: `Configuration de prix manquante pour le plan ${newPlan}`
      }
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // Update the subscription
    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: planConfig.stripePriceId,
        }
      ],
      metadata: {
        ...subscription.metadata,
        plan: newPlan
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Stripe subscription update error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe inconnue'
    }
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (atPeriodEnd) {
      // Cancel at the end of the current billing period
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    } else {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscriptionId)
    }

    return { success: true }
  } catch (error) {
    console.error('Stripe subscription cancellation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe inconnue'
    }
  }
}

export { stripe, PLAN_PRICING }
