'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Plus, Minus, Trash2, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface BasketProps {
  establishmentColor?: string
  isAdminView?: boolean
  basketEnabled?: boolean
}

export default function Basket({ establishmentColor, isAdminView = false, basketEnabled = true }: BasketProps) {
  // Don't render basket if it's disabled
  if (!basketEnabled) {
    return null
  }
  
  const { cartItems, updateQuantity, removeFromCart, totalItems, clearCart } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  useEffect(() => {
    if (totalItems === 0) setIsExpanded(false)
  }, [totalItems])

  const totalPrice = cartItems.reduce((total, cartItem) => 
            total + (cartItem.item.price_one || 0) * cartItem.quantity, 0
  )

  const handleCopyOrder = () => {
    const orderText = cartItems.map(cartItem => 
              `${cartItem.quantity}x ${cartItem.item.name} - ${((cartItem.item.price_one || 0) * cartItem.quantity).toFixed(2)}€`
    ).join('\n')
    
    const fullOrder = `Commande:\n${orderText}\n\nTotal: ${totalPrice.toFixed(2)}€`
    
    navigator.clipboard.writeText(fullOrder).then(() => {
      toast.success('Commande copiée!')
    }).catch(() => {
      toast.error('Erreur lors de la copie')
    })
  }

  if (totalItems === 0) return null

  const primaryColor = establishmentColor || '#3b82f6'

  return (
    <div className="w-full sticky top-[41px] z-20 transition-all duration-300">
      {/* Basket header bar */}
      <div 
        className="px-4 py-3 cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}ee)`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative transform transition-transform duration-300 hover:scale-110">
              <ChefHat className="w-7 h-7 text-white drop-shadow-sm" />
              <Badge 
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white shadow-lg"
              >
                {totalItems}
              </Badge>
            </div>
            <div className="text-white">
              <div className="font-semibold text-lg drop-shadow-sm">Ma commande</div>
              <div className="text-sm opacity-90">{totalItems} article{totalItems > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white text-right">
              <div className="font-bold text-xl drop-shadow-sm">{totalPrice.toFixed(2)}€</div>
              <div className="text-sm opacity-90">Appuyez pour {isExpanded ? 'fermer' : 'voir'}</div>
            </div>
            <div 
              className={`text-white text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            >
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'h-[calc(100vh-41px)]' : 'h-0'}`}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 p-4 h-full flex flex-col relative">
          <div className="space-y-3 flex-1 overflow-y-auto pb-20">
            {/* Scrollable items list */}
            <div className="flex-1  px-4 py-2">
              <div className="space-y-3 pb-4">
                {cartItems.map((cartItem, index) => (
                  <div 
                    key={cartItem.item.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      {/* Item image preview */}
                      {cartItem.item.image_url && (
                        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                          <Image
                            src={cartItem.item.image_url}
                            alt={cartItem.item.name}
                            className="object-cover w-full h-full"
                            width={56}
                            height={56}
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 truncate text-lg" title={cartItem.item.name}>
                          {cartItem.item.name}
                        </h4>
                        <p className="text-base text-gray-600 font-medium">
                          {cartItem.item.price_one?.toFixed(2)}€ × {cartItem.quantity} = {((cartItem.item.price_one || 0) * cartItem.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full hover:bg-white transition-all duration-200"
                        onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-lg">{cartItem.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full hover:bg-white transition-all duration-200"
                        onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-red-500 hover:bg-red-50 rounded-full ml-2 transition-all duration-200"
                        onClick={() => removeFromCart(cartItem.item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Move the buttons here, outside the scrollable area */}
            <div className="flex gap-3 mt-4 shrink-0 sticky bottom-0 left-0 right-0 px-4 pb-4 bg-white/90 z-10">
              <Button variant="outline" onClick={() => clearCart()} className="flex-1">
                Vider le panier
              </Button>
              <Button
                onClick={handleCopyOrder}
                className="flex-1"
                style={{
                  backgroundColor: establishmentColor || '#3b82f6'
                }}
              >
                Copier la commande
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
