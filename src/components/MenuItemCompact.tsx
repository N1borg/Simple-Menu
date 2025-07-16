import type { Category, MenuItem } from '@/types/supabase_types';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm";
import { getEstablishmentColor } from '@/lib/utils';

interface MenuItemCompactProps {
  item: MenuItem;
  category: Category;
  editingItem: string | null;
  setEditingItem: (id: string | null) => void;
  saveItem: (item: MenuItem) => Promise<void>;
  savingItemId: string | null;
  loadingAction: string | null;
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>;
  establishmentColor?: string;
  isAdmin?: boolean; // New prop to control admin features
  isDemo?: boolean;
}

export default function MenuItemCompact({
  item,
  category,
  editingItem,
  setEditingItem,
  saveItem,
  savingItemId,
  loadingAction,
  deleteMenuItem,
  establishmentColor,
  isAdmin = true, // Default to admin mode for backward compatibility
  isDemo = false,
}: MenuItemCompactProps) {
  const ringColor = getEstablishmentColor(establishmentColor);

  const [instantAvailable, setInstantAvailable] = useState(!!item.is_available);

  const titleSpanRef = useRef<HTMLSpanElement>(null)
    useEffect(() => {
      const el = titleSpanRef.current
      if (!el) return
      const fade = el.querySelector('.fade-title') as HTMLElement | null
      if (!fade) return
      const updateFade = () => {
        if (el.scrollWidth > el.clientWidth) {
          fade.style.display = 'block'
        } else {
          fade.style.display = 'none'
        }
      }
      updateFade()
      const resizeObserver = new window.ResizeObserver(updateFade)
      resizeObserver.observe(el)
      return () => resizeObserver.disconnect()
    }, [item.name])

  useEffect(() => {
    if (editingItem !== item.id) {
      setInstantAvailable(!!item.is_available);
    }
  }, [editingItem, item.is_available, item.id]);

  return (
    <Dialog
      open={editingItem === item.id}
      onOpenChange={(open) => {
        if (!open && editingItem === item.id) setEditingItem(null);
        if (open) setEditingItem(item.id);
      }}
    >
      <div className="menu-item-card relative group">
        <div
          className={`flex flex-col items-start gap-2 p-3 rounded-md shadow-md bg-white group-hover:ring-2 transition cursor-pointer h-full${!instantAvailable ? " line-through bg-gray-100 text-gray-400 border border-gray-200" : ""}`}
          style={{
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.07)",
            borderColor: "transparent",
            outline: "none",
            ...(editingItem === item.id ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}),
          }}
          onClick={() => setEditingItem(item.id)}
          tabIndex={0}
          role="button"
          aria-label={isAdmin ? `Modifier l'élément ${item.name}` : `Voir l'élément ${item.name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setEditingItem(item.id);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${ringColor}`;
          }}
          onMouseLeave={(e) => {
            if (editingItem !== item.id)
              e.currentTarget.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,0.07)";
          }}
        >
          <span
            ref={titleSpanRef}
            className="text-base font-semibold max-w-full overflow-hidden whitespace-nowrap relative self-start leading-tight"
            title={item.name}
            style={{
              textOverflow: "clip",
              display: "inline-block",
              width: "100%",
              position: "relative",
            }}
          >
            {item.name}
            <span
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "2em",
                height: "100%",
                background: "linear-gradient(to right, transparent, #fff 80%)",
                pointerEvents: "none",
                display: "none",
              }}
              className="fade-title"
            />
          </span>
          <div className="w-full flex justify-end mt-auto">
            <span className="font-bold">{item.price?.toFixed(2)}€</span>
          </div>
        </div>

        {/* Show admin dialog or public dialog based on isAdmin prop */}
        {isAdmin ? (
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
                setInstantAvailable(!!updatedItem.is_available);
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
        ) : (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>
                {item.description || 'Aucune description.'}
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
            <div className="mt-4 text-right font-bold text-lg">{item.price?.toFixed(2)}€</div>
            <DialogClose asChild>
              <Button variant="outline" className="mt-4 w-full">Fermer</Button>
            </DialogClose>
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}
