import { createSlice } from '@reduxjs/toolkit';

/* ================= SLICE ================= */
const shippingSlice = createSlice({
  name: 'shipping',
  initialState: {
    shipping: {},
  },

  reducers: {
    removeShipping: (state, action) => {
      state.shipping = state.shipping.filter(
        (shipping) => shipping._id !== action.payload
      );
    },
    setShipping(state, action) {
      state.shipping = action.payload;
    },
  },
  extraReducers: () => {},
});

export const { setShipping, removeShipping } = shippingSlice.actions;
export default shippingSlice.reducer;
