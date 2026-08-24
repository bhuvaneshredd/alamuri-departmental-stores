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

const LOCAL_CART_KEY = 'alamuri_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Save guest cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to cache cart locally', e);
    }
  }, [items]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Calculate guest pricing locally
      const sub = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
      const mrp = items.reduce((sum, i) => sum + (i.product?.mrp || i.product?.price || 0) * i.quantity, 0);
      const isFree = sub >= 299;
      const delivery = sub > 0 ? (isFree ? 0 : 25) : 0;
      const tax = Math.round(sub * 0.05 * 100) / 100;
      setPricing({
        subtotal: sub,
        mrpTotal: mrp,
        totalProductSavings: Math.max(0, mrp - sub),
        deliveryFee: delivery,
        isFreeDelivery: isFree,
        freeDeliveryThreshold: 299,
        amountNeededForFreeDelivery: isFree ? 0 : Math.max(0, 299 - sub),
        tax,
        taxPercentage: 5,
        couponDiscount: 0,
        couponCode: null,
        grandTotal: sub + delivery + tax,
        totalSavings: Math.max(0, mrp - sub),
      });
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
      console.error('Failed to load cart from server:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, appliedCoupon, items]);

  // Sync guest cart to server on login
  useEffect(() => {
    if (isAuthenticated) {
      const syncLocalCart = async () => {
        try {
          const localSaved = localStorage.getItem(LOCAL_CART_KEY);
          if (localSaved) {
            const localItems: CartItem[] = JSON.parse(localSaved);
            for (const item of localItems) {
              if (item.productId && item.quantity > 0) {
                await cartService.addItem(item.productId, item.quantity).catch(() => {});
              }
            }
          }
        } catch (e) {
          console.error('Error syncing local cart on login:', e);
        } finally {
          refreshCart();
        }
      };
      syncLocalCart();
    } else {
      refreshCart();
    }
  }, [isAuthenticated]);

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const addItem = async (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      // Add to guest cart locally
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            id: `guest_${product.id}_${Date.now()}`,
            cartId: 'guest_cart',
            productId: product.id,
            product,
            quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      });
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
    if (!isAuthenticated) {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
      return;
    }

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
    if (!isAuthenticated) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }

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
    localStorage.removeItem(LOCAL_CART_KEY);
    setItems([]);
    setPricing(null);

    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
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