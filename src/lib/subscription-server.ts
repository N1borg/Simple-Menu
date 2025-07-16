// lib/subscription-server.ts
// Server-side subscription utilities (API routes only)
import { getServerSupabase } from '@/lib/supabase'
import { SUBSCRIPTION_PLANS, SubscriptionPlan, UsageStats } from './subscription'

export class SubscriptionServerService {
  /**
   * Get current usage statistics for an establishment (server-side only)
   */
  static async getUsageStats(establishmentId: string): Promise<UsageStats> {
    try {
      const supabase = await getServerSupabase();
      
      // Get category count
      const { count: categoryCount, error: categoryError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('establishment_id', establishmentId);
      
      if (categoryError) {
        console.error('Error fetching category count:', categoryError);
        throw categoryError;
      }

      // Get menu item count
      const { count: itemCount, error: itemError } = await supabase
        .from('menu_items')
        .select('category_id, categories!inner(establishment_id)', { count: 'exact', head: true })
        .eq('categories.establishment_id', establishmentId);
      
      if (itemError) {
        console.error('Error fetching menu item count:', itemError);
        throw itemError;
      }

      return {
        categoriesUsed: categoryCount || 0,
        menuItemsUsed: itemCount || 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        categoriesUsed: 0,
        menuItemsUsed: 0,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get establishment plan and validate usage limits (server-side only)
   */
  static async validateUsageLimits(establishmentId: string): Promise<{
    plan: string;
    usage: UsageStats;
    canCreateCategory: boolean;
    canCreateMenuItem: boolean;
    categoriesRemaining: number;
    menuItemsRemaining: number;
  }> {
    try {
      const supabase = await getServerSupabase();
      
      // Get establishment plan
      const { data: establishment, error: establishmentError } = await supabase
        .from('establishments')
        .select('plan')
        .eq('id', establishmentId)
        .single();
      
      if (establishmentError || !establishment) {
        throw new Error('Establishment not found');
      }

      const plan = establishment.plan || 'essentiel';
      const usage = await this.getUsageStats(establishmentId);
      
      const planConfig = SUBSCRIPTION_PLANS[plan];
      if (!planConfig) {
        throw new Error(`Unknown plan: ${plan}`);
      }

      const canCreateCategory = planConfig.features.maxCategories === -1 || usage.categoriesUsed < planConfig.features.maxCategories;
      const canCreateMenuItem = planConfig.features.maxItems === -1 || usage.menuItemsUsed < planConfig.features.maxItems;
      
      const maxCategories = planConfig.features.maxCategories;
      const maxItems = planConfig.features.maxItems;
      
      const categoriesRemaining = maxCategories === -1 ? -1 : Math.max(0, maxCategories - usage.categoriesUsed);
      const menuItemsRemaining = maxItems === -1 ? -1 : Math.max(0, maxItems - usage.menuItemsUsed);

      return {
        plan,
        usage,
        canCreateCategory,
        canCreateMenuItem,
        categoriesRemaining,
        menuItemsRemaining,
      };
    } catch (error) {
      console.error('Error validating usage limits:', error);
      // Return safe defaults in case of error
      return {
        plan: 'essentiel',
        usage: { categoriesUsed: 0, menuItemsUsed: 0, lastUpdated: new Date() },
        canCreateCategory: false,
        canCreateMenuItem: false,
        categoriesRemaining: 0,
        menuItemsRemaining: 0,
      };
    }
  }

  /**
   * Get establishment subscription by slug (server-side only, for API routes)
   */
  static async getEstablishmentSubscription(slug: string): Promise<{
    establishmentId: string;
    plan: string;
    usage: UsageStats;
    canCreateCategory: boolean;
    canCreateMenuItem: boolean;
  } | null> {
    try {
      const supabase = await getServerSupabase();
      
      const { data: establishment, error } = await supabase
        .from('establishments')
        .select('id, plan')
        .eq('slug', slug)
        .single();
      
      if (error || !establishment) {
        return null;
      }

      const limits = await this.validateUsageLimits(establishment.id);
      
      return {
        establishmentId: establishment.id,
        plan: limits.plan,
        usage: limits.usage,
        canCreateCategory: limits.canCreateCategory,
        canCreateMenuItem: limits.canCreateMenuItem,
      };
    } catch (error) {
      console.error('Error getting establishment subscription:', error);
      return null;
    }
  }
}
