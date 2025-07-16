// lib/subscription.ts

export interface SubscriptionPlan {
  id: 'essentiel' | 'pro' | 'premium';
  name: string;
  price: number; // in cents
  currency: 'EUR';
  features: {
    maxCategories: number;
    maxItems: number;
    customBranding: boolean;
    analytics: boolean;
    pwaSupport: boolean;
    emailSupport: boolean;
    phoneSupport: boolean;
    apiAccess: boolean;
    multiLocation: boolean;
  };
  stripeProductId?: string;
  stripePriceId?: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  essentiel: {
    id: 'essentiel',
    name: 'Essentiel',
    price: 699, // 6.99€ (launch price)
    currency: 'EUR',
    features: {
      maxCategories: 5,
      maxItems: 50,
      customBranding: false,
      analytics: false,
      pwaSupport: false,
      emailSupport: true,
      phoneSupport: false,
      apiAccess: false,
      multiLocation: false,
    },
    stripeProductId: process.env.STRIPE_PRODUCT_ESSENTIEL,
    stripePriceId: process.env.STRIPE_PRICE_ESSENTIEL,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1299, // 12.99€ (launch price)
    currency: 'EUR',
    features: {
      maxCategories: 15,
      maxItems: 200,
      customBranding: true,
      analytics: true,
      pwaSupport: true,
      emailSupport: true,
      phoneSupport: true,
      apiAccess: false,
      multiLocation: false,
    },
    stripeProductId: process.env.STRIPE_PRODUCT_PRO,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 1999, // 19.99€ (launch price)
    currency: 'EUR',
    features: {
      maxCategories: -1, // unlimited
      maxItems: -1, // unlimited
      customBranding: true,
      analytics: true,
      pwaSupport: true,
      emailSupport: true,
      phoneSupport: true,
      apiAccess: true,
      multiLocation: true,
    },
    stripeProductId: process.env.STRIPE_PRODUCT_PREMIUM,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
  },
};

export interface SubscriptionStatus {
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface UsageStats {
  categoriesUsed: number;
  menuItemsUsed: number;
  lastUpdated: Date;
}

export class SubscriptionService {
  static getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS[planId] || null;
  }

  static canCreateCategories(plan: string, currentCount: number): boolean {
    const planConfig = this.getPlan(plan);
    if (!planConfig) return false;
    
    const maxCategories = planConfig.features.maxCategories;
    return maxCategories === -1 || currentCount < maxCategories;
  }

  static canCreateMenuItems(plan: string, currentCount: number): boolean {
    const planConfig = this.getPlan(plan);
    if (!planConfig) return false;
    
    const maxItems = planConfig.features.maxItems;
    return maxItems === -1 || currentCount < maxItems;
  }

  static hasFeature(plan: string, feature: keyof SubscriptionPlan['features']): boolean {
    const planConfig = this.getPlan(plan);
    if (!planConfig) return false;
    
    return planConfig.features[feature] === true;
  }

  static async createStripeSession(planId: string, establishmentSlug: string, successUrl: string, cancelUrl: string) {
    const plan = this.getPlan(planId);
    if (!plan?.stripePriceId) {
      throw new Error('Plan not found or Stripe not configured');
    }

    // This would integrate with Stripe
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: plan.stripePriceId,
    //     quantity: 1,
    //   }],
    //   success_url: successUrl,
    //   cancel_url: cancelUrl,
    //   client_reference_id: establishmentSlug,
    //   metadata: {
    //     establishmentSlug,
    //     plan: planId,
    //   },
    // });
    
    // return session.url;
    
    throw new Error('Stripe integration not implemented yet');
  }
}

// Usage tracking middleware
export function withUsageTracking<T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      
      // Track successful operation
      const duration = Date.now() - startTime;
      
      return result;
    } catch (error) {
      // Track failed operation - error is already being thrown
      throw error;
    }
  }) as T;
}
