function calculateSalePrice({ basePrice, discount }) {
  if (!discount || !discount.type || !discount.value) {
    return basePrice;
  }

  let price = basePrice;

  if (discount.type === 'percentage') {
    price = basePrice - (basePrice * discount.value) / 100;
  } else if (discount.type === 'fixed') {
    price = basePrice - discount.value;
  }

  return Math.max(Math.round(price), 0);
}