import type { Category, MenuItem } from '@/types/supabase_types';
import Image from 'next/image';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm";
import { toast } from "sonner";
import DietaryBadge from "@/components/DietaryBadge";
import ItemImageUpload from '@/components/ItemImageUpload';

interface MenuItemDialogProps {
  item: MenuItem;
  category: Category;
  isAdmin: boolean;
  isDemo?: boolean;
  plan: string;
  savingItemId: string | null;
  loadingAction: string | null;
  saveItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>;
  setEditingItem: (id: string | null) => void;
  setInstantAvailable: (available: boolean) => void;
  basketEnabled?: boolean;
  isInCart?: (itemId: string) => boolean;
  addToCart?: (item: MenuItem) => void;
  removeFromCart?: (itemId: string) => void;
  establishmentColor?: string;
  categoryIsAvailable?: boolean;
  categoryDietary?: { vegan: boolean; alcoholFree: boolean };
}

export default function MenuItemDialog({
  item,
  category,
  isAdmin,
  isDemo = false,
  plan = 'essentiel',
  savingItemId,
  loadingAction,
  saveItem,
  deleteMenuItem,
  setEditingItem,
  setInstantAvailable,
  basketEnabled = false,
  isInCart,
  addToCart,
  removeFromCart,
  establishmentColor,
  categoryIsAvailable,
  categoryDietary = { vegan: false, alcoholFree: false },
}: MenuItemDialogProps) {
  if (isAdmin) {
    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'élément</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'élément puis cliquez sur enregistrer.
          </DialogDescription>
        </DialogHeader>
        {/* Item image upload for admin */}
        <ItemImageUpload
          item={item}
          isDemo={isDemo}
          color={establishmentColor}
          onImageUploaded={(url) => {
            // Update the image_url in the form (simulate a change)
            // This will require a refetch or state update in parent, but for now, just update the item prop if possible
            item.image_url = url;
          }}
        />
        <MenuItemDialogForm
          item={item}
          isDemo={isDemo}
          savingItemId={savingItemId}
          loadingAction={loadingAction}
          plan={plan || 'essentiel'}
          onSubmit={async (updatedItem) => {
            try {
              await saveItem(updatedItem);
            } catch (err) {
              toast.error("Erreur lors de la sauvegarde de l'élément");
            }
            setInstantAvailable?.(!!updatedItem.is_available);
            setEditingItem(null);
          }}
          onDelete={async () => {
            if (isDemo) {
              toast.info("Modification désactivée (mode démo).");
              return;
            }
            try {
              await deleteMenuItem(category.id, item.id);
            } catch (err) {
              toast.error("Erreur lors de la suppression de l'élément");
            }
            setEditingItem(null);
          }}
          onCancel={() => setEditingItem(null)}
        />
      </DialogContent>
    );
  }
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{item.name}</DialogTitle>
        <DialogDescription>
          {item.description || 'Aucune description.'}
        </DialogDescription>
      </DialogHeader>
      {item.image_url && (
        <div className="relative w-full h-48">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="rounded-lg object-cover"
            sizes="(max-width: 425px) 100vw, 300px"
          />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-lg">{item.price_one?.toFixed(2)}€</span>
        <div className="flex items-center gap-2">
          {/* Show category-level badges (with text) if present */}
          {categoryDietary.vegan && (
            <DietaryBadge type="vegan" size="sm" showText={true} />
          )}
          {categoryDietary.alcoholFree && (
            <DietaryBadge type="alcohol-free" size="sm" showText={true} />
          )}
          {/* Only show vegan badge if item is vegan and category is NOT all vegan */}
          {item.vegan && !categoryDietary.vegan && (
            (!item.is_available || !categoryIsAvailable) && !isAdmin ? null : (
              <DietaryBadge 
                type="vegan" 
                variant={!item.is_available || !categoryIsAvailable ? "ghost" : "active"} 
              />
            )
          )}
          {/* Only show alcohol-free badge if item is alcohol-free and category is NOT all alcohol-free */}
          {item.alcohol_free && !categoryDietary.alcoholFree && (
            (!item.is_available || !categoryIsAvailable) && !isAdmin ? null : (
              <DietaryBadge 
                type="alcohol-free" 
                variant={!item.is_available || !categoryIsAvailable ? "ghost" : "active"} 
              />
            )
          )}
          {basketEnabled && (
            <Checkbox
              checked={isInCart?.(item.id) || false}
              onCheckedChange={(checked: boolean) => {
                if (checked && addToCart) {
                  addToCart(item);
                } else if (!checked && removeFromCart) {
                  removeFromCart(item.id);
                }
              }}
              accentColor={establishmentColor || '#3a4fff'}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="h-6 w-6"
            />
          )}
        </div>
      </div>
      <DialogClose asChild>
        <Button variant="outline" className="mt-4 w-full">Fermer</Button>
      </DialogClose>
    </DialogContent>
  );
}
