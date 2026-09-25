'use client';

import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Variants({
  productData,
  selectedVariant,
  onVariantSelect,
}) {
  const variants = productData?.variants || [];

  // Get all unique colors and sizes from variants
  const allColors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const allSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  // Initialize with selectedVariant or first variant
  const [selectedColor, setSelectedColor] = useState(
    selectedVariant?.color || (allColors.length > 0 ? allColors[0] : null)
  );
  const [selectedSize, setSelectedSize] = useState(
    selectedVariant?.size || (allSizes.length > 0 ? allSizes[0] : null)
  );

  // When both color and size are selected, find matching variant
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const foundVariant = variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );

      if (foundVariant) {
        onVariantSelect(foundVariant);
      } else {
        // If no variant exists for this combination, find any variant with selected color
        const colorVariant = variants.find((v) => v.color === selectedColor);
        if (colorVariant) {
          onVariantSelect(colorVariant);
          setSelectedSize(colorVariant.size);
        } else {
          // If no variant with selected color, find any variant
          const firstVariant = variants[0];
          if (firstVariant) {
            onVariantSelect(firstVariant);
            setSelectedColor(firstVariant.color);
            setSelectedSize(firstVariant.size);
          }
        }
      }
    }
  }, [selectedColor, selectedSize, variants, onVariantSelect]);

  // Get stock for selected variant or product
  const getCurrentStock = () => {
    if (selectedVariant && selectedVariant.stock !== undefined) {
      return selectedVariant.stock;
    }
    return productData?.stock || 0;
  };

  // Get price for selected variant or product
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price || 0;
    }
    return productData?.salePrice || productData?.price || 0;
  };

  // Get original price for selected variant or product
  const getOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price || 0;
    }
    return productData?.regularPrice || productData?.price || 0;
  };

  // Get discount for selected variant or product
  const getDiscount = () => {
    const original = getOriginalPrice();
    const current = getCurrentPrice();

    if (original > 0 && current < original) {
      const discountPercent = ((original - current) / original) * 100;
      return Math.round(discountPercent);
    }
    return 0;
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    // Find a variant with this color
    const colorVariant = variants.find((v) => v.color === color);
    if (colorVariant) {
      // If current size doesn't match, update size
      if (selectedSize !== colorVariant.size) {
        setSelectedSize(colorVariant.size);
      }
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);

    // Find a variant with this size
    const sizeVariant = variants.find((v) => v.size === size);
    if (sizeVariant) {
      // If current color doesn't match, update color
      if (selectedColor !== sizeVariant.color) {
        setSelectedColor(sizeVariant.color);
      }
    }
  };

  // Check if color has stock
  const isColorInStock = (color) => {
    return variants.some((v) => v.color === color && v.stock > 0);
  };

  // Check if size has stock
  const isSizeInStock = (size) => {
    return variants.some((v) => v.size === size && v.stock > 0);
  };

  if (variants.length === 0) return null;

  const currentStock = getCurrentStock();
  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discount = getDiscount();

  return (
    <div className="space-y-6 p-4 bg-white rounded-xl border border-gray-200">
      {/* PRICE DISPLAY */}
      <div className="space-y-2">
        <div className="text-3xl font-bold text-green-700">৳{currentPrice}</div>

        {discount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-500 line-through">
              ৳{originalPrice}
            </span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
              Save {discount}%
            </span>
          </div>
        )}
      </div>

      {/* COLOR SELECTION */}
      {allColors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">Color:</p>
            {selectedColor && (
              <span className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedColor}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {allColors.map((color) => {
              const inStock = isColorInStock(color);
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  disabled={!inStock}
                  style={{ backgroundColor: color }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 relative
                    ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 border-gray-700 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                    }
                    ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={`${color}${!inStock ? ' (Out of Stock)' : ''}`}
                >
                  {isSelected && inStock && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE SELECTION */}
      {allSizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">Size:</p>
            {selectedSize && (
              <span className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedSize}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {allSizes.map((size) => {
              const inStock = isSizeInStock(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!inStock}
                  className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }
                    ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STOCK STATUS */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentStock > 0
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            currentStock > 0 ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        <span className="font-medium">
          {currentStock > 0
            ? `In Stock (${currentStock} available)`
            : 'Out of Stock'}
        </span>
      </div>

      {/* SELECTED VARIANT INFO */}
      {selectedVariant && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            Selected Variant:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedVariant.color }}
                ></div>
                <span className="font-medium">{selectedVariant.color}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500">Size</p>
              <p className="font-medium">{selectedVariant.size}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500">Price</p>
              <p className="font-bold text-green-700">
                ৳{selectedVariant.salePrice || selectedVariant.price}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500">Stock</p>
              <p
                className={`font-medium ${
                  selectedVariant.stock > 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {selectedVariant.stock} available
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
