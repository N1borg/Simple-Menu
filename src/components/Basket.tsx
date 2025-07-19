'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/components/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Plus, Minus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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

  // Position directly below admin banner with no gap
  const topPosition = isAdminView ? 'top-12' : 'top-0'

  return (
    <div className={`fixed ${topPosition} left-0 right-0 z-40`}>
      {/* Basket bar */}
      <div 
        className="px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-md"
        style={{
          background: `linear-gradient(135deg, ${establishmentColor || '#3b82f6'}, ${establishmentColor || '#3b82f6'}dd)`,
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ChefHat className="w-6 h-6 text-white" />
              <Badge 
                className="absolute -top-2 -right-2 rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white"
              >
                {totalItems}
              </Badge>
            </div>
            <div className="text-white">
              <div className="font-semibold">Ma commande</div>
              <div className="text-xs opacity-90">{totalItems} article{totalItems > 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white text-right">
              <div className="font-bold text-lg">{totalPrice.toFixed(2)}€</div>
              <div className="text-xs opacity-90">Appuyez pour voir</div>
            </div>
            <div className="text-white">
              {isExpanded ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cartItems.map(cartItem => (
              <div key={cartItem.item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-1">
                  <h4 className="font-medium">{cartItem.item.name}</h4>
                  <p className="text-sm text-gray-600">{cartItem.item.price_one?.toFixed(2)}€</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 p-0 rounded-full"
                    onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center font-bold">{cartItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-7 h-7 p-0 rounded-full"
                    onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-7 h-7 p-0 text-red-500"
                    onClick={() => removeFromCart(cartItem.item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
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

      {/* Page content padding */}
      <div className={`transition-all duration-300 ${isExpanded ? (isAdminView ? 'h-32' : 'h-20') : (isAdminView ? 'h-20' : 'h-16')}`} />
    </div>
  )
}
