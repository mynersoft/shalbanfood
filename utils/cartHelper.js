// lib/cartUtils.ts
import {
  GuestCartItem,
  BackendCartItem,
  ICartItem,
  IProduct,
} from '@/types/cart';

/**
 * Get guest cart from localStorage
 */
export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const cartData = localStorage.getItem('guestCart');
    if (!cartData) return [];

    const items = JSON.parse(cartData);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
}

/**
 * Save guest cart to localStorage
 */
export function setGuestCart(cart: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('guestCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
}

/**
 * Clear guest cart from localStorage
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('guestCart');
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
}

/**
 * Merge guest cart with backend cart
 * Priority: Backend cart quantities + Guest cart items not in backend
 */
export function mergeLocally(
  backendCart: BackendCartItem[],
  guestCart: GuestCartItem[]
): ICartItem[] {
  const mergedMap = new Map<string, ICartItem>();

  // Add backend items first (these have priority)
  backendCart.forEach((item) => {
    const product = item.product as IProduct;
    if (product && product._id) {
      mergedMap.set(product._id, {
        _id: product._id,
        product,
        quantity: item.quantity,
        price: item.price || product.price,
      });
    }
  });

  // Add guest items that don't exist in backend
  guestCart.forEach((item) => {
    if (item.product && item.product._id && !mergedMap.has(item.product._id)) {
      mergedMap.set(item.product._id, {
        _id: item.product._id,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      });
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Convert backend cart items to ICartItem format
 */
export function normalizeBackendCart(
  backendCart: BackendCartItem[]
): ICartItem[] {
  return backendCart
    .filter((item) => item.product && typeof item.product === 'object')
    .map((item) => {
      const product = item.product as IProduct;
      return {
        _id: product._id,
        product,
        quantity: item.quantity,
        price: item.price || product.price,
      };
    });
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(items: ICartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.product.discount
      ? (item.product.price * (100 - item.product.discount)) / 100
      : item.product.price;
    return total + price * item.quantity;
  }, 0);
}

/**
 * Calculate total quantity
 */
export function calculateTotalQuantity(items: ICartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
