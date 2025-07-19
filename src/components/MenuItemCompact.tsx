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
import { Checkbox } from "@/components/ui/checkbox";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { MenuItemDialogForm } from "@/components/MenuItemDialogForm";
import { getEstablishmentColor } from '@/lib/utils';
import { useCart } from '@/components/hooks/useCart';
import MenuItemDialog from '@/components/MenuItemDialog';
import DietaryBadge from '@/components/DietaryBadge';

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
  basketEnabled?: boolean; // New prop to control basket checkbox visibility
  hideDietaryBadges?: { vegan?: boolean; alcoholFree?: boolean }; // Hide badges if category has them
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
  basketEnabled = true, // Default to enabled for backward compatibility
  hideDietaryBadges = { vegan: false, alcoholFree: false }
}: MenuItemCompactProps) {
  const ringColor = getEstablishmentColor(establishmentColor);
  
  // Cart functionality - only use in non-admin mode
  const cartHook = !isAdmin ? useCart() : null
  const addToCart = cartHook?.addToCart
  const removeFromCart = cartHook?.removeFromCart
  const isInCart = cartHook?.isInCart

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
                    <div className="flex-1 min-w-0">
            <span
              ref={titleSpanRef}
              className="text-base font-semibold max-w-full overflow-hidden whitespace-nowrap relative leading-tight"
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
            {/* Dietary badges - only show if not hidden by category */}
            <div className="flex gap-1 mt-1">
              {item.vegan && !hideDietaryBadges.vegan && <DietaryBadge type="vegan" size="sm" />}
              {item.alcohol_free && !hideDietaryBadges.alcoholFree && <DietaryBadge type="alcohol-free" size="sm" />}
            </div>
          </div>
          <div className="w-full flex justify-between items-end mt-auto">
            <span className="font-bold">{item.price_one?.toFixed(2)}€</span>
            {!isAdmin && basketEnabled && (
              <Checkbox
                checked={isInCart?.(item.id) || false}
                onCheckedChange={(checked) => {
                  if (checked && addToCart) {
                    addToCart(item)
                  } else if (!checked && removeFromCart) {
                    removeFromCart(item.id)
                  }
                }}
                accentColor={establishmentColor}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>

        {/* Show admin dialog or public dialog using reusable component */}
        <MenuItemDialog
          item={item}
          category={category}
          isAdmin={isAdmin}
          isDemo={isDemo}
          savingItemId={savingItemId}
          loadingAction={loadingAction}
          saveItem={saveItem}
          deleteMenuItem={deleteMenuItem}
          setEditingItem={setEditingItem}
          setInstantAvailable={setInstantAvailable}
          basketEnabled={basketEnabled}
          isInCart={isInCart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          establishmentColor={establishmentColor}
        />
      </div>
    </Dialog>
  );
}
