
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty,
    updateQuantity,
    clearCart,
    hydrateCart,
    selectCartItems,
    selectCartTotalItems,
    selectCartTotal,
    selectIsCartHydrated,
} from '@/redux/store/slices/cartSlice';

export function useInitializeCart() {
    const dispatch = useDispatch();
    const hydrated = useSelector(selectIsCartHydrated);

    useEffect(() => {
        if (!hydrated) {
            dispatch(hydrateCart());
        }
    }, [dispatch, hydrated]);
}

export function useCart() {
    const items = useSelector(selectCartItems);
    const totalItems = useSelector(selectCartTotalItems);
    const total = useSelector(selectCartTotal);
    const hydrated = useSelector(selectIsCartHydrated);

    return {
        items,
        totalItems,
        total,
        hydrated,
    };
}

export function useAddToCart() {
    const dispatch = useDispatch();

    return (product, quantity = 1) => {
        dispatch(addToCart({ product, quantity }));
    };
}

export function useRemoveFromCart() {
    const dispatch = useDispatch();

    return (productId, variantId = null, variantKey = null) => {
        dispatch(
            removeFromCart({
                productId,
                variantId,
                variantKey,
            })
        );
    };
}

export function useCartQuantity() {
    const dispatch = useDispatch();

    return {
        increment: (productId, variantId = null, variantKey = null) =>
            dispatch(
                incrementQty({ productId, variantId, variantKey })
            ),

        decrement: (productId, variantId = null, variantKey = null) =>
            dispatch(
                decrementQty({ productId, variantId, variantKey })
            ),

        update: (productId, quantity, variantId = null, variantKey = null) =>
            dispatch(
                updateQuantity({
                    productId,
                    quantity,
                    variantId,
                    variantKey,
                })
            ),

        clear: () => dispatch(clearCart()),
    };
}
