'use client';

import { useSelector } from 'react-redux';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowRight,
  Tag,
} from 'lucide-react';

import { calculateShippingFee } from '@/lib/calculateShippingFee';

import CheckEmptyCart from '@/components/Cart/CheckEmptyCart';
import CartItems from '@/components/Cart/CartItems';

export default function CartPage() {
  const { items = [] } = useSelector(
    (state) => state.cart
  );

  /*
   * Calculate final price for one product
   */
  const calculateFinalPrice = (item) => {
    // Product schema:
    // regularPrice
    // sellPrice

    const sellPrice = Number(item.sellPrice);
    const regularPrice = Number(item.regularPrice);

    let basePrice = 0;

    if (
      Number.isFinite(sellPrice) &&
      sellPrice >= 0
    ) {
      basePrice = sellPrice;
    } else if (
      Number.isFinite(regularPrice) &&
      regularPrice >= 0
    ) {
      basePrice = regularPrice;
    }

    /*
     * No discount
     */
    if (
      !item.discount ||
      !item.discount.value
    ) {
      return basePrice;
    }

    const discountValue = Number(
      item.discount.value
    );

    if (
      !Number.isFinite(discountValue) ||
      discountValue < 0
    ) {
      return basePrice;
    }

    /*
     * Percentage discount
     */
    if (
      item.discount.type === 'percentage'
    ) {
      return Math.max(
        basePrice -
          (basePrice * discountValue) / 100,
        0
      );
    }

    /*
     * Fixed discount
     */
    if (item.discount.type === 'fixed') {
      return Math.max(
        basePrice - discountValue,
        0
      );
    }

    return basePrice;
  };

  /*
   * Cart subtotal
   */
  const subtotal = items.reduce(
    (acc, item) => {
      const price =
        calculateFinalPrice(item);

      const quantity =
        Number(item.quantity) || 0;

      return acc + price * quantity;
    },
    0
  );

  /*
   * Total quantity
   */
  const totalQty = items.reduce(
    (acc, item) => {
      return (
        acc + (Number(item.quantity) || 0)
      );
    },
    0
  );

  /*
   * Shipping
   */
  const shippingFee =
    calculateShippingFee({
      subtotal,
      location: 'Dhaka',
    });

  /*
   * Grand total
   */
  const grandTotal =
    subtotal + Number(shippingFee || 0);

  /*
   * Empty cart
   */
  if (items.length === 0) {
    return <CheckEmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex flex-col lg:flex-row gap-8">

        {/* =========================
            CART ITEMS
        ========================== */}
        <CartItems />

        {/* =========================
            CART TOTAL
        ========================== */}
        <div className="lg:w-2/3">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

              <div className="text-lg">

                <span className="text-gray-600">
                  Total ({totalQty} items):
                </span>

                <span className="text-2xl font-bold text-gray-900 ml-2">
                  ৳{subtotal.toFixed(2)}
                </span>

              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                <Link
                  href="/shop"
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-center"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>

            {/* Free Shipping */}
            {subtotal < 1000 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl">

                <div className="flex items-center gap-2">

                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="flex-1">

                    <p className="font-medium text-blue-800">
                      Add ৳
                      {(1000 - subtotal).toFixed(2)}
                      {' '}
                      more to get free shipping!
                    </p>

                    <div className="w-full bg-blue-100 rounded-full h-2 mt-1">

                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (subtotal / 1000) * 100,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =========================
            ORDER SUMMARY
        ========================== */}
        <div className="lg:w-1/3">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">

            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">

              {/* Subtotal */}
              <div className="flex justify-between text-gray-600">

                <span>
                  Subtotal ({totalQty} items)
                </span>

                <span className="font-medium">
                  ৳{subtotal.toFixed(2)}
                </span>

              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-600">

                <span>
                  Shipping
                </span>

                <span className="font-medium text-green-600">
                  {shippingFee === 0
                    ? 'Free'
                    : `৳${Number(
                        shippingFee
                      ).toFixed(2)}`}
                </span>

              </div>

            </div>

            {/* Grand Total */}
            <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between items-center">

              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>

              <span className="text-2xl font-bold text-blue-600">
                ৳{grandTotal.toFixed(2)}
              </span>

            </div>

            {/* Checkout */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              <ShoppingCart size={20} />

              Proceed to Checkout

              <ArrowRight size={20} />
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}