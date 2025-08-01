import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { categoryId } = await req.json();
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

  // Remove id and timestamps, set new name
  const { id, created_at, ...categoryData } = category;
  const newCategory = {
    ...categoryData,
    name: category.name + ' (copie)',
    // display_order: category.display_order + 1, // Optionally increment order
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
