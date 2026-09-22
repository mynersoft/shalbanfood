'use client';

import {
  X,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  Tag,
  Truck,
  Shield,
  Package,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/redux/store/slices/cartSlice';
import { toggleWishlist } from '@/redux/store/slices/wishlistSlice';
import { toast } from 'react-hot-toast';

export default function ProductQuickView({ product, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const isWishlisted = product
    ? wishlist.some((item) => item._id === product._id)
    : false;

  useEffect(() => {
    // Initialize selected variant
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handlePreviousImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      quantity,
      selectedVariant,
      selectedColor,
      selectedSize,
    };

    dispatch(addToCart(itemToAdd));
    toast.success('Added to cart!');
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  const hasVariants = product.variants?.length > 0;
  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];

  const currentPrice =
    hasVariants && selectedVariant
      ? selectedVariant.price
      : product.salePrice || product.price;

  const originalPrice =
    hasVariants && selectedVariant
      ? selectedVariant.originalPrice || product.price
      : product.price;

  const discount = Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100
  );
  const imgSrc =
  (hasVariants
    ? product.variants?.[0]?.images?.[0]
    : product.images?.[0]) ?? "/placeholder.png";
   

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Close quick view"
          >
            <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-full max-h-[500px] aspect-square overflow-hidden rounded-2xl bg-gray-50 group">
                <Image
                  src={
                    imgSrc
                  }
                  alt={product.name}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Navigation Arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-red-500 text-white font-bold text-sm rounded-full shadow-lg">
                    -
                    {hasVariants
                      ? product.variants[0].discount.value
                      : product.discount.value}
                    %
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="relative w-full h-full bg-gray-100">
                        <Image
                          src={img}
                          alt={`${product.name} - view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Product Title & Rating */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.rating || 'No'} • {product.reviewCount || 0}{' '}
                    reviews
                  </span>
                  <span className="text-green-600 font-medium">
                    {product.stock || 'In Stock'} stock
                  </span>
                </div>

                {/* SKU */}
                <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-900">
                    {hasVariants
                      ? product.variants[0].salePrice
                      : product.salePrice || product.price}
                    tk
                  </span>

                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {hasVariants
                        ? product.variants[0].price
                        : product.regularPrice}
                      tk
                    </span>
                    <span className="px-2 py-1 bg-red-50 text-red-600 font-semibold text-sm rounded">
                      {hasVariants
                        ? product.variants[0].discount.value
                        : product.discount.value}
                      % OFF
                    </span>
                  </>
                </div>

                <p className="text-green-600 font-medium">
                  You save{' '}
                  {hasVariants
                    ? product.variants[0].discount.value
                    : product.discount.value}
                  % off the regular price
                </p>
              </div>

              {hasVariants && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full w-7 h-7 border transition-all ${
                            selectedColor === color
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                       <div className={`h-full w-full bg-[${color}]`}>
                            
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
              
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full border font-medium transition-all ${
                            selectedSize === size
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                 
                  </div>
                </>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-16 text-center font-medium text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-8 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all hover:shadow-lg active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Free Shipping</p>
                      <p className="text-xs text-gray-500">Over ৳1000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">2 Year Warranty</p>
                      <p className="text-xs text-gray-500">Full Coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Easy Returns</p>
                      <p className="text-xs text-gray-500">30 Day Policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Tag className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">Best Price</p>
                      <p className="text-xs text-gray-500">Guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
