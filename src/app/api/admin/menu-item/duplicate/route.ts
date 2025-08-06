import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { requireSecureAdminAuth } from '@/lib/auth';
import { SubscriptionServerService } from '@/lib/subscription-server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { isDemoSlug } from '@/lib/validate';
import { auditLog, getRequestMetadata, STANDARD_ERRORS } from '@/lib/security';

export async function POST(req: NextRequest) {
  const requestMetadata = getRequestMetadata(req)
  let slug = 'unknown'

  try {
    const auth = await requireSecureAdminAuth(req)
    if ('slug' in auth === false) return auth as NextResponse
    slug = (auth as { slug: string }).slug

    const { itemId, display_order } = await req.json();
    if (!itemId) {
      auditLog({
        action: 'menu_item_duplicate_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Missing itemId' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      auditLog({
        action: 'menu_item_duplicate_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.FORBIDDEN }, { status: 403 })
    }

    // Check subscription limits and plan features
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'menu_item_duplicate_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Establishment not found' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 })
    }

    // Check if plan allows duplication (Pro/Premium only)
    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    if (!planConfig) {
      auditLog({
        action: 'menu_item_duplicate_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Plan not recognized', plan: subscription.plan }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 })
    }

    if (subscription.plan === 'essentiel') {
      auditLog({
        action: 'menu_item_duplicate_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Feature restricted for plan', plan: subscription.plan }
      })
      return NextResponse.json({ 
        error: STANDARD_ERRORS.FORBIDDEN,
        code: 'FEATURE_RESTRICTED',
        requiredPlan: 'pro'
      }, { status: 403 })
    }

    // Check if can create new item (duplication creates a new item)
    if (!subscription.canCreateMenuItem) {
      const maxItems = planConfig?.features.maxItems || 0
      auditLog({
        action: 'menu_item_duplicate_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Subscription limit reached',
          currentUsage: subscription.usage.menuItemsUsed,
          maxAllowed: maxItems,
          plan: subscription.plan
        }
      })
      return NextResponse.json({ 
        error: STANDARD_ERRORS.FORBIDDEN,
        code: 'SUBSCRIPTION_LIMIT_REACHED',
        currentUsage: subscription.usage.menuItemsUsed,
        maxAllowed: maxItems
      }, { status: 403 })
    }

    const supabase = await getServerSupabase();

    // Fetch the item to duplicate
    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      auditLog({
        action: 'menu_item_duplicate_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          reason: 'Item not found',
          itemId,
          dbError: itemError?.code,
          dbMessage: itemError?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.NOT_FOUND }, { status: 404 });
    }

    // Remove id, timestamps, set new display_order
    const { id, created_at, ...itemData } = item;
    const newDisplayOrder = typeof display_order === 'number' ? display_order : (item.display_order ?? 0) + 1;
    const newItem = {
      ...itemData,
      display_order: newDisplayOrder,
    };

    // Insert new item
    const { data: insertedItem, error: insertItemError } = await supabase
      .from('menu_items')
      .insert([newItem])
      .select()
      .single();

    if (insertItemError || !insertedItem) {
      auditLog({
        action: 'menu_item_duplicate_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { 
          itemId,
          dbError: insertItemError?.code,
          dbMessage: insertItemError?.message
        }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 });
    }

    // Update display_order for all items in the same category with display_order >= newDisplayOrder, except the new one
    if (insertedItem.category_id) {
      const { data: itemsToUpdate } = await supabase
        .from('menu_items')
        .select('id, display_order')
        .neq('id', insertedItem.id)
        .eq('category_id', insertedItem.category_id)
        .gte('display_order', newDisplayOrder);

      if (itemsToUpdate && itemsToUpdate.length > 0) {
        for (const itemToUpdate of itemsToUpdate) {
          await supabase
            .from('menu_items')
            .update({ display_order: (itemToUpdate.display_order ?? 0) + 1 })
            .eq('id', itemToUpdate.id)
            .eq('category_id', insertedItem.category_id);
        }
      }
    }

    auditLog({
      action: 'menu_item_duplicate_success',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { 
        originalItemId: itemId,
        duplicatedItemId: insertedItem.id,
        categoryId: insertedItem.category_id,
        newDisplayOrder,
        plan: subscription.plan,
        usage: subscription.usage
      }
    })

    return NextResponse.json({ success: true, item: insertedItem });

  } catch (error) {
    auditLog({
      action: 'menu_item_duplicate_error',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ error: STANDARD_ERRORS.SERVER_ERROR }, { status: 500 })
  }
}
