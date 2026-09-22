export function calculateShippingFee({
  subtotal,
  location, // "dhaka" | "other"
}) {
  let baseShipping = 0;

  // 1️⃣ Location based shipping
  if (location === 'dhaka') {
    baseShipping = 60;
  } else {
    baseShipping = 100;
  }

  // 2️⃣ Order amount based shipping
  if (subtotal >= 3000) {
    return 0; // Free delivery
  }

  if (subtotal >= 2000) {
    return Math.ceil(baseShipping / 2); // Half delivery
  }

  return baseShipping; // Full delivery
}
