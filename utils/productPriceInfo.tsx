import { IProduct } from '@/types/product';

interface ProductInfo {
  hasDiscount: boolean;
  discountValue: number | null;
  discountType: 'percentage' | 'fixed' | null;
  regularPrice: number;
  salePrice: number;
  stock: number;
  imgSrc: string;
}

export const getProductInfo = (
  product: IProduct | null | undefined
): ProductInfo => {
  if (!product) {
    return {
      hasDiscount: false,
      discountValue: null,
      discountType: null,
      regularPrice: 0,
      salePrice: 0,
      stock: 0,
      imgSrc: '/placeholder.png',
    };
  }

  const regularPrice = product.regularPrice || 0;
  const salePrice = product.salePrice || regularPrice;
  const stock = product.stock || 0;
  const imgSrc =
    product.featureImg ||
    product.galleryImages?.[0] ||
    '/placeholder-product.jpg';

  // Discount logic
  const hasDiscount = Boolean(product.discount && product.discount.value > 0);
  const discountValue = hasDiscount ? product.discount!.value : null;
  const discountType = hasDiscount ? product.discount!.type : null;

  return {
    hasDiscount,
    discountValue,
    discountType,
    regularPrice,
    salePrice,
    stock,
    imgSrc,
  };
};
