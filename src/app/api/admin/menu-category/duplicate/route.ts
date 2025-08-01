import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { categoryId, display_order } = await req.json();
  if (!categoryId) {
    return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
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

  // Remove id, timestamps, and menu_items, set new name and display_order
  const { id, created_at, menu_items, ...categoryData } = category;
  const newDisplayOrder = typeof display_order === 'number' ? display_order : (category.display_order ?? 0) + 1;
  const newCategory = {
    ...categoryData,
    name: `Category ${newDisplayOrder}`, // category.name
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
  if (category.menu_items && category.menu_items.length > 0) {
    const itemsToInsert = category.menu_items.map((item: any) => {
      const { id, created_at, ...itemData } = item;
      return {
        ...itemData,
        category_id: insertedCat.id,
      };
    });
    if (itemsToInsert.length > 0) {
      await supabase.from('menu_items').insert(itemsToInsert);
    }
  }

  return NextResponse.json({ success: true, category: insertedCat });
}
