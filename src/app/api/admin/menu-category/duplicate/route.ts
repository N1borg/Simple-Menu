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

    const { categoryId, display_order } = await req.json();
    
    auditLog({
      action: 'category_duplicate_attempt',
      severity: 'info',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { categoryId, display_order }
    })

    if (!categoryId) {
      auditLog({
        action: 'category_duplicate_failed',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { error: 'Missing categoryId' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    // Blocage des modifications en mode démo
    if (isDemoSlug(slug)) {
      auditLog({
        action: 'category_duplicate_blocked',
        severity: 'warning',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { reason: 'Demo mode restriction' }
      })
      return NextResponse.json({ error: STANDARD_ERRORS.DEMO_BLOCKED }, { status: 403 })
    }

    // Check subscription limits and plan features
    const subscription = await SubscriptionServerService.getEstablishmentSubscription(slug)
    if (!subscription) {
      auditLog({
        action: 'category_duplicate_failed',
        severity: 'error',
        user: slug,
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
        method: requestMetadata.method,
        url: requestMetadata.url,
        details: { error: 'Establishment not found' }
      })
      return NextResponse.json({ 
        success: false, 
        error: STANDARD_ERRORS.NOT_FOUND
      }, { status: 404 })
    }

    // Check if plan allows duplication (Pro/Premium only)
    const planConfig = SUBSCRIPTION_PLANS[subscription.plan]
    if (!planConfig) {
    auditLog({
      action: 'category_duplicate_failed',
      severity: 'error',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: 'Invalid plan', plan: subscription.plan }
    })
    return NextResponse.json({ 
      success: false, 
      error: STANDARD_ERRORS.BAD_REQUEST
    }, { status: 400 })
  }

  if (subscription.plan === 'essentiel') {
    auditLog({
      action: 'category_duplicate_blocked',
      severity: 'warning',
      user: slug,
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { reason: 'Plan restriction', plan: subscription.plan }
    })
    return NextResponse.json({ 
      success: false, 
      error: STANDARD_ERRORS.FORBIDDEN,
      code: 'FEATURE_RESTRICTED',
      requiredPlan: 'pro'
    }, { status: 403 })
  }

  // Check if can create new category (duplication creates a new category)
  if (!subscription.canCreateCategory) {
    const maxCategories = planConfig?.features.maxCategories || 0
    return NextResponse.json({ 
      success: false, 
      error: `Limite de catégories atteinte (${maxCategories} max pour le plan ${planConfig?.name || subscription.plan}). Passez à un plan supérieur pour ajouter plus de catégories.`,
      code: 'SUBSCRIPTION_LIMIT_REACHED',
      currentUsage: subscription.usage.categoriesUsed,
      maxAllowed: maxCategories
    }, { status: 403 })
  }

  const supabase = await getServerSupabase();

  // Fetch the category and its menu items
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*, menu_items(*)')
    .eq('id', categoryId)
    .single();

  if (catError || !category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  // Check if duplicating items would exceed limits
  const itemsToCreate = category.menu_items?.length || 0;
  if (itemsToCreate > 0) {
    const maxItems = planConfig.features.maxItems;
    const currentItems = subscription.usage.menuItemsUsed;
    const wouldExceedLimit = maxItems !== -1 && (currentItems + itemsToCreate) > maxItems;
    
    if (wouldExceedLimit) {
      return NextResponse.json({ 
        success: false, 
        error: `La duplication de cette catégorie créerait ${itemsToCreate} articles supplémentaires, ce qui dépasserait votre limite de ${maxItems} articles (actuellement ${currentItems}). Passez à un plan supérieur ou supprimez des articles existants.`,
        code: 'SUBSCRIPTION_LIMIT_REACHED',
        currentUsage: currentItems,
        maxAllowed: maxItems,
        wouldCreate: itemsToCreate
      }, { status: 403 })
    }
  }

  // Remove id, timestamps, and menu_items, set new name and display_order
  const { id, created_at, menu_items, ...categoryData } = category;
  const newDisplayOrder = typeof display_order === 'number' ? display_order : (category.display_order ?? 0) + 1;
  const newCategory = {
    ...categoryData,
    name: category.name,
    display_order: newDisplayOrder,
  };

  // Insert new category
  const { data: insertedCat, error: insertCatError } = await supabase
    .from('categories')
    .insert([newCategory])
    .select()
    .single();

  if (insertCatError || !insertedCat) {
    return NextResponse.json({ error: 'Failed to duplicate category' }, { status: 500 });
  }

  // Increment display_order of all categories with display_order >= newDisplayOrder, except the new one
  // (This assumes display_order is unique and used for ordering)
  // Increment display_order for all categories (except the new one) with display_order >= newDisplayOrder
  // Increment display_order for all categories (except the new one) with display_order >= newDisplayOrder
  const { data: catsToUpdate } = await supabase
    .from('categories')
    .select('id, display_order')
    .neq('id', insertedCat.id)
    .eq('establishment_id', insertedCat.establishment_id as string)
    .gte('display_order', newDisplayOrder);

  if (catsToUpdate && catsToUpdate.length > 0) {
    for (const cat of catsToUpdate) {
      await supabase
        .from('categories')
        .update({ display_order: (cat.display_order ?? 0) + 1 })
        .eq('id', cat.id)
        .eq('establishment_id', insertedCat.establishment_id as string);
    }
  }

  // Duplicate menu items
  let duplicatedItems: any[] = [];
  if (category.menu_items && category.menu_items.length > 0) {
    const itemsToInsert = category.menu_items.map((item: any) => {
      const { id, created_at, ...itemData } = item;
      return {
        ...itemData,
        category_id: insertedCat.id,
      };
    });
    if (itemsToInsert.length > 0) {
      const { data: insertedItems } = await supabase.from('menu_items').insert(itemsToInsert).select();
      duplicatedItems = insertedItems || [];
    }
  }

  auditLog({
    action: 'category_duplicate_success',
    severity: 'info',
    user: slug,
    ip: requestMetadata.ip,
    userAgent: requestMetadata.userAgent,
    method: requestMetadata.method,
    url: requestMetadata.url,
    details: { 
      categoryId,
      newCategoryId: insertedCat.id,
      itemsCreated: duplicatedItems.length 
    }
  })

  return NextResponse.json({ success: true, category: insertedCat, menu_items: duplicatedItems });

  } catch (error) {
    auditLog({
      action: 'category_duplicate_error',
      severity: 'error',
      user: slug || 'unknown',
      ip: requestMetadata.ip,
      userAgent: requestMetadata.userAgent,
      method: requestMetadata.method,
      url: requestMetadata.url,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    
    return NextResponse.json({ 
      error: STANDARD_ERRORS.SERVER_ERROR 
    }, { status: 500 })
  }
}
