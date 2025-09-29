'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { MenuItem } from '@/types/supabase_types'

export interface CartItem {
  item: MenuItem
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  isInCart: (itemId: string) => boolean
  getCartQuantity: (itemId: string) => number
  totalItems: number
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.item.id === item.id)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(cartItem => cartItem.item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems(prev =>
      prev.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    )
  }

  const isInCart = (itemId: string) => {
    return cartItems.some(cartItem => cartItem.item.id === itemId)
  }

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const totalItems = cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0)

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      isInCart,
      getCartQuantity,
      totalItems,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
