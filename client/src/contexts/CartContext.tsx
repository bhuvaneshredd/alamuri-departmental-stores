import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, PricingBreakdown, Product } from '../types';
import { cartService } from '../services';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  grandTotal: number;
  pricing: PricingBreakdown | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  appliedCoupon: string | null;
  setAppliedCoupon: (coupon: string | null) => void;
  refreshCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setPricing(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await cartService.getCart(appliedCoupon || undefined);
      if (res.data.success && res.data.data) {
        setItems(res.data.data.items || []);
        setPricing(res.data.data.pricing || null);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, appliedCoupon]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const addItem = async (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const res = await cartService.addItem(product.id, quantity);
      if (res.data.success && res.data.data) {
        setItems(res.data.data.items || []);
        setPricing(res.data.data.pricing || null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.data.success && res.data.data) {
        setItems(res.data.data.items || []);
        setPricing(res.data.data.pricing || null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await cartService.removeItem(productId);
      if (res.data.success && res.data.data) {
        setItems(res.data.data.items || []);
        setPricing(res.data.data.pricing || null);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      await cartService.clearCart();
      setItems([]);
      setPricing(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = pricing?.subtotal || items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const grandTotal = pricing?.grandTotal || subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        grandTotal,
        pricing,
        isDrawerOpen,
        setIsDrawerOpen,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        refreshCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};