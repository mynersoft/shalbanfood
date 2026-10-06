import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
};

const productSlice = createSlice({
  name: 'product',
  initialState,

  reducers: {
    setProducts(state, action) {
      state.products = Array.isArray(action.payload)
        ? action.payload
        : [];
      state.loading = false;
    },

    addProduct(state, action) {
      if (action.payload) {
        state.products.unshift(action.payload);
      }
    },

    updateProduct(state, action) {
      const updated = action.payload;

      if (!updated?._id) return;

      const index = state.products.findIndex(
        (product) => product._id === updated._id
      );

      if (index !== -1) {
        state.products[index] = updated;
      }
    },

    removeProduct(state, action) {
      state.products = state.products.filter(
        (product) => product._id !== action.payload
      );
    },

    setLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
} = productSlice.actions;

export default productSlice.reducer;