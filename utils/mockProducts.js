// utils/mockProducts.js
import mongoose from 'mongoose';

export const generateMockProducts = (count = 10) => {
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Smart Watch Series 5',
    'Premium Cotton T-Shirt',
    'Leather Wallet with RFID',
    'Stainless Steel Water Bottle',
    'Ergonomic Office Chair',
    'Organic Green Tea',
    'Fitness Tracker Band',
    'UV Protection Sunglasses',
    'Yoga Mat Premium',
    'Portable Bluetooth Speaker',
    'Laptop Backpack',
    'Smartphone Stand',
    'Digital Kitchen Scale',
    'Electric Toothbrush'
  ];

  const brands = ['Nike', 'Apple', 'Samsung', 'Sony', 'Adidas', 'Puma', 'Levi\'s', 'Zara', 'H&M', 'Amazon Basics'];
  
  const categories = ['Electronics', 'Clothing', 'Accessories', 'Home & Kitchen', 'Sports', 'Health & Beauty'];

  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy', 'Brown'];
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

  const products = [];

  for (let i = 0; i < count; i++) {
    const productId = new mongoose.Types.ObjectId();
    const hasVariants = Math.random() > 0.5;
    const variantsCount = hasVariants ? Math.floor(Math.random() * 3) + 1 : 0;
    
    const variants = [];
    let totalStock = 0;
    
    if (hasVariants && variantsCount > 0) {
      for (let j = 0; j < variantsCount; j++) {
        const variantStock = Math.floor(Math.random() * 100) + 10;
        totalStock += variantStock;
        
        variants.push({
          size: sizes[Math.floor(Math.random() * sizes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          price: Math.floor(Math.random() * 5000) + 1000,
          stock: variantStock,
          salePrice: Math.floor(Math.random() * 4000) + 800,
          discount: Math.random() > 0.7 ? {
            type: Math.random() > 0.5 ? 'percentage' : 'fixed',
            value: Math.random() > 0.5 ? 20 : 500
          } : undefined,
          startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          vendor: new mongoose.Types.ObjectId(),
          images: [`https://picsum.photos/300/300?random=${i}${j}`],
          ...(Math.random() > 0.5 && { endDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) })
        });
      }
    }

    const regularPrice = Math.floor(Math.random() * 5000) + 1000;
    const salePrice = Math.floor(Math.random() * 4000) + 800;
    const hasDiscount = Math.random() > 0.5;
    
    const productTypes = ['featured', 'new', 'best-selling', 'regular'];
    const type = productTypes[Math.floor(Math.random() * productTypes.length)];

    products.push({
      _id: productId,
      name: `${productNames[Math.floor(Math.random() * productNames.length)]} ${Math.floor(Math.random() * 1000)}`,
      slug: `product-${i}-${Date.now()}`,
      regularPrice: regularPrice,
      salePrice: hasDiscount ? salePrice : regularPrice,
      ...(hasDiscount && {
        discount: {
          type: Math.random() > 0.5 ? 'percentage' : 'fixed',
          value: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 1000) + 100
        }
      }),
      brand: brands[Math.floor(Math.random() * brands.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      sold: Math.floor(Math.random() * 500),
      stock: hasVariants ? totalStock : Math.floor(Math.random() * 100) + 10,
      variants: variants,
      description: `High-quality ${productNames[Math.floor(Math.random() * productNames.length)].toLowerCase()} with premium features. Designed for comfort and durability.`,
      images: [`https://picsum.photos/400/400?random=${i}`, `https://picsum.photos/400/400?random=${i+100}`],
      type: type,
      rating: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      freeDelivery: Math.random() > 0.5,
      reviews: Array.from({ length: Math.floor(Math.random() * 10) }, () => new mongoose.Types.ObjectId()),
      questions: Array.from({ length: Math.floor(Math.random() * 5) }, () => new mongoose.Types.ObjectId()),
      isActive: true,
      metaTitle: `Buy ${productNames[Math.floor(Math.random() * productNames.length)]} Online`,
      metaDescription: `Shop the best ${productNames[Math.floor(Math.random() * productNames.length)].toLowerCase()} at great prices. Free delivery available.`,
      keywords: ['electronics', 'fashion', 'accessories', 'premium'],
      sku: `SKU-${Date.now()}-${i}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    });
  }

  return products;
};

export const filterProductsByType = (products, type) => {
  return products.filter(product => product.type === type);
};

export const getNewArrivals = (products, days = 30) => {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return products.filter(product => 
    new Date(product.createdAt) > cutoffDate
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};