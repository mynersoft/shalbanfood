/**
 * Get product pricing, discount, and stock info safely
 * Handles both products with variants and without variants
 * @param {Object} product
 * @returns {Object} { hasDiscount, discountValue, regularPrice, salePrice, stock }
 */

export function getProductInfo(product) {
  if (!product) {
    return {
      hasDiscount: false,
      discountValue: null,
      regularPrice: 0,
      salePrice: 0,
      stock: 0,
    };
  }

  const hasVariants = product.variants?.length > 0;

  let regularPrice = 0;
  let salePrice = 0;
  let hasDiscount = false;
  let discountValue = null;
  let stock = 0;
  let imgSrc = '';

  if (hasVariants && product.variants[0]) {
    const variant = product.variants[0];

    regularPrice = variant.price || 0;
    salePrice = variant.salePrice || variant.price || 0;
    hasDiscount = variant.discount?.value > 0;
    discountValue = hasDiscount ? variant.discount.value : null;
    stock = variant.stock ?? 0;
  } else {
    regularPrice = product.regularPrice || product.price || 0;
    salePrice = product.salePrice || product.regularPrice || product.price || 0;
    hasDiscount = product.discount?.value > 0;
    discountValue = hasDiscount ? product.discount.value : null;
    stock = product.stock ?? 0;
  }

  const getImageSrc = () => {
    if (hasVariants && product.variants[0]?.images?.[0]) {
      return product.variants[0].images[0];
    }

    if (product.images?.[0]) {
      return product.images[0];
    }

    return '/placeholder.png';
  };
  imgSrc = getImageSrc();

  return { hasDiscount, discountValue, regularPrice, salePrice, stock, imgSrc };
}
