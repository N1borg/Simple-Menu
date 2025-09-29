import type { Category, MenuItem } from '@/types/supabase_types';
import { Dialog } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CopyPlus, Crown, Loader2 } from "lucide-react";
import ProCrown from '@/components/ui/ProCrown';
import { useRef, useEffect, useState } from "react";
import { getEstablishmentColor } from '@/lib/utils';
import { useCart } from '@/components/hooks/useCart';
import MenuItemDialog from '@/components/MenuItemDialog';
import DietaryBadge from '@/components/DietaryBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MenuItemCompactProps {
  item: MenuItem;
  category: Category;
  plan: string;
  editingItem: string | null;
  setEditingItem: (id: string | null) => void;
  saveItem: (item: MenuItem) => Promise<void>;
  savingItemId: string | null;
  loadingAction: string | null;
  deleteMenuItem: (catId: string, itemId: string) => Promise<void>;
  duplicateItem?: (itemId: string) => Promise<void>;
  establishmentColor?: string;
  textColor?: string;
  isAdmin?: boolean; // New prop to control admin features
  isDemo?: boolean;
  basketEnabled?: boolean; // New prop to control basket checkbox visibility
  hideDietaryBadges?: { vegan?: boolean; alcoholFree?: boolean }; // Hide badges if category has them
  categoryIsAvailable?: boolean; // New prop to check if category is available
  isGloballyLoading?: boolean; // Global loading state
  canCreateMenuItem?: boolean; // Whether user can create more items (subscription limit)
  isFirstItemInFirstCategory?: boolean; // For tutorial targeting
}

export default function MenuItemCompact({
  item,
  category,
  plan = 'essentiel',
  editingItem,
  setEditingItem,
  saveItem,
  savingItemId,
  loadingAction,
  deleteMenuItem,
  duplicateItem,
  establishmentColor,
  textColor,
  isAdmin = true, // Default to admin mode for backward compatibility
  isDemo = false,
  basketEnabled = true, // Default to enabled for backward compatibility
  hideDietaryBadges = { vegan: false, alcoholFree: false },
  categoryIsAvailable = true, // Default to true for backward compatibility
  isGloballyLoading = false,
  canCreateMenuItem = true,
  isFirstItemInFirstCategory = false
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
      <div className={`menu-item-card relative group${isFirstItemInFirstCategory ? ' tutorial-edit-item' : ''}`}>
        <div
          className={
            `bg-white rounded-xl shadow-md p-3 flex flex-col gap-2 group-hover:ring-2 transition cursor-pointer h-full${!instantAvailable ? " bg-gray-100 text-gray-400 border border-gray-200" : ""}`
          }
          style={{
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
            borderColor: 'transparent',
            outline: 'none',
            ...(editingItem === item.id ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}),
          }}
          onClick={() => setEditingItem(item.id)}
          tabIndex={0}
          role="button"
          aria-label={isAdmin ? `Modifier l'élément ${item.name}` : `Voir l'élément ${item.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEditingItem(item.id) }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${ringColor}`
          }}
          onMouseLeave={e => {
            if (editingItem !== item.id) e.currentTarget.style.boxShadow = '0 1px 4px 0 rgba(0,0,0,0.07)'
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                ref={titleSpanRef}
                className={`text-base font-semibold max-w-full overflow-hidden whitespace-nowrap relative leading-tight flex-1 ${!instantAvailable ? 'line-through' : ''}`}
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
              {/* Dietary badges - always show, but in ghost mode under certain conditions */}
              <div className="flex gap-1 flex-shrink-0">
                {item.vegan && (
                  (!instantAvailable || !categoryIsAvailable || hideDietaryBadges.vegan) && !isAdmin ? null : (
                    <DietaryBadge 
                      type="vegan" 
                      size="sm" 
                      showText={false} 
                      variant={!instantAvailable || !categoryIsAvailable || hideDietaryBadges.vegan ? "ghost" : "active"}
                    />
                  )
                )}
                {item.alcohol_free && (
                  (!instantAvailable || !categoryIsAvailable || hideDietaryBadges.alcoholFree) && !isAdmin ? null : (
                    <DietaryBadge 
                      type="alcohol-free" 
                      size="sm" 
                      showText={false} 
                      variant={!instantAvailable || !categoryIsAvailable || hideDietaryBadges.alcoholFree ? "ghost" : "active"}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          <div className="w-full flex justify-between items-end mt-auto">
            <span className={`font-bold ${!instantAvailable ? 'line-through' : ''}`}>{item.price_one?.toFixed(2)}€</span>
            <div className="flex items-center gap-2">
              {isAdmin && duplicateItem && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateItem(item.id);
                        }}
                        title="Dupliquer l'article"
                        className={`cursor-pointer h-6 w-6 p-0 ${!instantAvailable ? 'text-gray-900' : ''}`}
                        disabled={item.id.startsWith('temp-') || Boolean(loadingAction) || isGloballyLoading}
                      >
                        {(isGloballyLoading || Boolean(loadingAction)) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CopyPlus className="w-4 h-4" />
                        )}
                      </Button>
                      {plan === 'essentiel' && !isGloballyLoading && (
                        <span
                          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow z-10"
                          style={{ transform: 'rotate(18deg)' }}
                        >
                          <ProCrown className="w-3 h-3 !w-3 !h-3 text-yellow-500 drop-shadow" />
                        </span>
                      )}
                      {plan !== 'essentiel' && !canCreateMenuItem && !isGloballyLoading && (
                        <span
                          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-white rounded-full shadow z-10"
                          style={{ transform: 'rotate(18deg)' }}
                        >
                          <Crown className="w-3 h-3 text-yellow-500 drop-shadow" />
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dupliquer l'article</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {!isAdmin && basketEnabled && (
                <Checkbox
                  checked={isInCart?.(item.id) || false}
                  onCheckedChange={(checked: boolean) => {
                    if (checked && addToCart) {
                      addToCart(item)
                    } else if (!checked && removeFromCart) {
                      removeFromCart(item.id)
                    }
                  }}
                  accentColor={establishmentColor}
                  onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => e.stopPropagation()}
                  className="h-6 w-6"
                />
              )}
            </div>
          </div>
        </div>

        {/* Show admin dialog or public dialog using reusable component */}
        <MenuItemDialog
          item={item}
          category={category}
          isAdmin={isAdmin}
          isDemo={isDemo}
          plan={plan}
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
          categoryIsAvailable={categoryIsAvailable}
          categoryDietary={{
            vegan: hideDietaryBadges.vegan || false,
            alcoholFree: hideDietaryBadges.alcoholFree || false
          }}
        />
      </div>
    </Dialog>
  );
}
