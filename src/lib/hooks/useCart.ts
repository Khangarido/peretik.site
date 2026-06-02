'use client'

import { useCartStore } from '@/lib/store/cartStore'

export function useCart() {
  const store = useCartStore()

  return {
    items: store.items,
    isOpen: store.isOpen,
    couponCode: store.couponCode,
    couponDiscount: store.couponDiscount,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQty,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
    setCoupon: store.setCoupon,
    removeCoupon: store.removeCoupon,
    totalItems: store.getCount(),
    subtotal: store.getSubtotal(),
    total: store.getTotal(),
  }
}
