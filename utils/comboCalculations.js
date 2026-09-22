// utils/comboCalculations.js
export function calculateComboPricing(products, comboPrice) {
  // Calculate total regular price
  const totalRegularPrice = products.reduce((total, product) => {
    const productTotal = product.price * (product.quantity || 1);
    return total + productTotal;
  }, 0);
  
  // Calculate discount
  const discountAmount = totalRegularPrice - comboPrice;
  const discountPercent = totalRegularPrice > 0 
    ? Math.round((discountAmount / totalRegularPrice) * 100)
    : 0;
  
  // Calculate per product savings
  const perProductSavings = products.length > 0 
    ? discountAmount / products.length 
    : 0;
  
  // Calculate average prices
  const averageProductPrice = products.length > 0 
    ? totalRegularPrice / products.length 
    : 0;
  
  const averageDiscountedPrice = products.length > 0 
    ? comboPrice / products.length 
    : 0;
  
  return {
    totalRegularPrice,
    comboPrice,
    discountAmount,
    discountPercent,
    perProductSavings,
    averageProductPrice,
    averageDiscountedPrice,
    summary: {
      totalValue: totalRegularPrice,
      youPay: comboPrice,
      youSave: discountAmount,
      discount: `${discountPercent}%`,
      itemsCount: products.length,
      savingsPerItem: `৳${perProductSavings.toFixed(2)}`
    },
    validation: {
      isValidPrice: comboPrice > 0 && comboPrice <= totalRegularPrice,
      isProfitable: comboPrice > 0,
      discountValid: discountPercent >= 0 && discountPercent <= 100
    }
  };
}

// Validate combo data
export function validateComboData(comboData) {
  const errors = [];
  
  if (!comboData.title?.trim()) {
    errors.push('Combo title is required');
  }
  
  if (!comboData.products || !Array.isArray(comboData.products) || comboData.products.length === 0) {
    errors.push('At least one product is required');
  }
  
  if (!comboData.comboPrice || isNaN(comboData.comboPrice)) {
    errors.push('Valid combo price is required');
  } else if (comboData.comboPrice <= 0) {
    errors.push('Combo price must be greater than 0');
  }
  
  // Validate each product
  if (comboData.products) {
    comboData.products.forEach((product, index) => {
      if (!product.productId) {
        errors.push(`Product ${index + 1}: Product ID is required`);
      }
      if (!product.quantity || product.quantity < 1) {
        errors.push(`Product ${index + 1}: Quantity must be at least 1`);
      }
    });
  }
  
  // Validate dates
  if (comboData.startDate && comboData.endDate) {
    const startDate = new Date(comboData.startDate);
    const endDate = new Date(comboData.endDate);
    
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}