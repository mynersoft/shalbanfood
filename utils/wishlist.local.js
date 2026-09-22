const KEY = 'tomart_wishlist';

export const getLocalWishlist = () => {
  return JSON.parse(localStorage.getItem(KEY)) || [];
};

export const addLocalWishlist = (id) => {
  const list = getLocalWishlist();
  const updated = [...new Set([...list, id])];
  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const removeLocalWishlist = (id) => {
  const list = getLocalWishlist().filter((x) => x !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const clearLocalWishlist = () => {
  localStorage.removeItem(KEY);
};
