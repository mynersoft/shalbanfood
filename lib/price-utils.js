
export function calculatePrice(variant) {
    const buyPrice = Number(variant.buyPrice) || 0;
    const regularPrice = Number(variant.regularPrice) || 0;
    const sellPrice = Number(variant.sellPrice) || 0;

    const discount = Math.max(0, regularPrice - sellPrice);

    const discountPercentage =
        regularPrice > 0
            ? Math.round((discount / regularPrice) * 100)
            : 0;

    const profit = sellPrice - buyPrice;

    return {
        discount,
        discountPercentage,
        profit,
        hasLoss: profit < 0,
    };
}
