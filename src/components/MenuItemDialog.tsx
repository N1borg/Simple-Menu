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

interface MenuItemDialogProps {
  item: MenuItem;
  category: Category;
  isAdmin: boolean;
  isDemo?: boolean;
  savingItemId: string | null;
  loadingAction: string | null;
  saveItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>;
  setEditingItem: (id: string | null) => void;
  setInstantAvailable?: (val: boolean) => void;
  basketEnabled?: boolean;
  isInCart?: (id: string) => boolean;
  addToCart?: (item: MenuItem) => void;
  removeFromCart?: (id: string) => void;
  establishmentColor?: string;
}

export default function MenuItemDialog({
  item,
  category,
  isAdmin,
  isDemo = false,
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
        <MenuItemDialogForm
          item={item}
          isDemo={isDemo}
          savingItemId={savingItemId}
          loadingAction={loadingAction}
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
          {item.description || 'Aufzecune description.'}
        </DialogDescription>
      </DialogHeader>
      {item.image_url && (
        <div className="flex justify-center">
          <Image
            src={item.image_url}
            alt={item.name}
            width={300}
            height={200}
            className="rounded-lg object-cover max-h-48"
          />
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-lg">{item.price_one?.toFixed(2)}€</span>
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
          />
        )}
      </div>
      <DialogClose asChild>
        <Button variant="outline" className="mt-4 w-full">Fermer</Button>
      </DialogClose>
    </DialogContent>
  );
}
