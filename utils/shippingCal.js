export const shippingCal = (locations, userLocation) => {
  if (!Array.isArray(locations) || locations.length === 0) {
    return 0;
  }

  if (!userLocation) {
    const defaultShipping = locations.find((item) => item.isDefault);
    return Number(defaultShipping?.cost) || 0;
  }

  const location = userLocation.trim().toLowerCase();

  // Exact district match
  const match = locations.find(
    (item) => item?.district?.trim().toLowerCase() === location
  );

  if (match) {
    return Number(match.cost) || 0;
  }

  // Default shipping
  const defaultShipping = locations.find((item) => item?.isDefault === true);

  return Number(defaultShipping?.cost) || 0;
};
