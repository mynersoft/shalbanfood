'use client';

import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '@/redux/store/slices/cartSlice';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import Image from 'next/image';
import CheckEmptyCart from './CheckEmptyCart';



const CartItems = () => {
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.cart);

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
    toast.success('Product removed from cart');
  };

  const handleQuantityChange = (productId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ productId, quantity: newQty }));
  };

  // Get product image
  const getProductImage = (item) => {
    if (item.featureImg) return item.featureImg;
    if (item.galleryImages && item.galleryImages.length > 0)
      return item.galleryImages[0];
    return '/placeholder.png';
  };

  // Calculate final price after discount
  const calculateFinalPrice = (item) => {
    const basePrice = item.salePrice || item.regularPrice || 0;

    if (!item.discount?.value) return basePrice;

    if (item.discount.type === 'percentage') {
      return (basePrice * (100 - item.discount.value)) / 100;
    } else if (item.discount.type === 'fixed') {
      return Math.max(basePrice - item.discount.value, 0);
    }

    return basePrice;
  };

  // Get discount text
  const getDiscountText = (item) => {
    if (!item.discount?.value) return null;

    if (item.discount.type === 'percentage') {
      return `${item.discount.value}% OFF`;
    } else if (item.discount.type === 'fixed') {
      return `৳${item.discount.value} OFF`;
    }

    return null;
  };

  // Calculate item total
  const calculateItemTotal = item => {
    const finalPrice = calculateFinalPrice(item);
    return finalPrice * item.quantity;
  };

  // Get original price (before discount)
  const getOriginalPrice = item => {
    return item.salePrice || item.regularPrice || 0;
  };

  return (
    <div className="lg:flex-1">
      {/* Empty Cart State */}
      {items.length === 0 ? (
        <CheckEmptyCart />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-600">
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Cart Items */}
          {items.map((item, index) => {
            const originalPrice = getOriginalPrice(item);
            const finalPrice = calculateFinalPrice(item);
            const discountText = getDiscountText(item);
            const itemTotal = calculateItemTotal(item);
            const originalItemTotal = originalPrice * item.quantity;
            const savedAmount = originalItemTotal - itemTotal;
            const productImage = getProductImage(item);
            const hasDiscount = finalPrice < originalPrice;

            return (
              <div
                key={`${item._id}-${index}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  {/* Product Image & Info */}
                  <div className="flex items-start gap-4 md:w-5/12">
                    <div className="relative w-24 h-24 bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-2 shrink-0">
                      <Image
                        src={productImage}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                      {/* Discount Badge */}
                      {discountText && (
                        <div className="absolute -top-2 -left-2 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {discountText}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>


                      {/* Price Display for Mobile */}
                      <div className="md:hidden">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            ৳{finalPrice.toLocaleString()}
                          </span>
                          
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Column (Desktop) */}
                  <div className="hidden md:block md:w-2/12">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        ৳{finalPrice.toLocaleString()}
                      </div>
                      {hasDiscount && (
                        <div className="space-y-1">
                          <div className="text-gray-400 line-through text-sm">
                            ৳{originalPrice.toLocaleString()}
                          </div>
                         
                          
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="md:w-3/12">
                    <div className="flex items-center justify-between md:justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-14 h-10 flex items-center justify-center bg-gray-50 rounded-xl font-bold text-gray-900 text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {/* Remove Button (Mobile) */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="md:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && item.stock > 0 && (
                      <p className="text-xs text-amber-600 text-center mt-2">
                        Max stock reached
                      </p>
                    )}
                  </div>

                  {/* Total & Remove (Desktop) */}
                  <div className="md:w-2/12">
                    <div className="flex items-center justify-between md:justify-end md:flex-col md:items-end gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ৳{itemTotal.toLocaleString()}
                        </div>
                        {savedAmount > 0 && (
                          <div className="text-sm text-green-600 font-semibold">
                            Saved ৳{savedAmount.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          ৳{finalPrice.toLocaleString()} × {item.quantity}
                        </div>
                      </div>

                      {/* Remove Button (Desktop) */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary for Mobile */}
                <div className="mt-4 pt-4 border-t border-gray-100 md:hidden">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Item Total:{' '}
                      <span className="font-bold text-gray-900">
                        ৳{itemTotal.toLocaleString()}
                      </span>
                    </div>
                    {savedAmount > 0 && (
                      <div className="text-sm font-semibold text-green-600">
                        You save ৳{savedAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartItems;
