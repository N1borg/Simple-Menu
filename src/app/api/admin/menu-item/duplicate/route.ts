import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { requireSecureAdminAuth } from '@/lib/auth';
import { SubscriptionServerService } from '@/lib/subscription-server';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import { isDemoSlug } from '@/lib/validate';
import { auditLog } from '@/lib/security';

export async function POST(req: NextRequest) {
  const auth = await requireSecureAdminAuth(req)
  if ('slug' in auth === false) return auth as NextResponse
  const slug = (auth as { slug: string }).slug

  const { itemId, display_order } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
  }

  // Blocage des modifications en mode démo
  if (isDemoSlug(slug)) {
    return NextResponse.json({ error: 'Modification désactivée (mode démo).' }, { status: 403 })
  }

  // Check subscription limits and plan features
  const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
  if (!subscription) {
    return NextResponse.json({ 
      success: false, 
      error: 'Établissement non trouvé' 
    }, { status: 404 })
  }

  // Check if plan allows duplication (Pro/Premium only)
  const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
  if (!planConfig) {
    return NextResponse.json({ 
      success: false, 
      error: 'Plan non reconnu' 
    }, { status: 400 })
  }

  if (subscription.plan === 'essentiel') {
    return NextResponse.json({ 
      success: false, 
      error: 'La duplication d\'articles est une fonctionnalité Pro et Premium. Passez à un plan supérieur pour utiliser cette option.',
      code: 'FEATURE_RESTRICTED',
      requiredPlan: 'pro'
    }, { status: 403 })
  }

  // Check if can create new item (duplication creates a new item)
  if (!subscription.canCreateMenuItem) {
    const maxItems = planConfig?.features.maxItems || 0
    return NextResponse.json({ 
      success: false, 
      error: `Limite d'articles atteinte (${maxItems} max pour le plan ${planConfig?.name || subscription.plan}). Passez à un plan supérieur pour ajouter plus d'articles.`,
      code: 'SUBSCRIPTION_LIMIT_REACHED',
      currentUsage: subscription.usage.menuItemsUsed,
      maxAllowed: maxItems
    }, { status: 403 })
  }

  const supabase = await getServerSupabase();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'

  // Fetch the item to duplicate
  const { data: item, error: itemError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
    auditLog({ action: 'menu_item_duplicate_failed', ip, details: { itemId, error: insertItemError } })
    return NextResponse.json({ error: 'Failed to duplicate item' }, { status: 500 });
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
    action: 'menu_item_duplicate', 
    ip, 
    details: { 
      originalItemId: itemId,
      duplicatedItem: insertedItem, 
      plan: subscription.plan,
      usage: subscription.usage 
    } 
  })

  return NextResponse.json({ success: true, item: insertedItem });
}
