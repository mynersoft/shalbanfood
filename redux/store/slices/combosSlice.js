import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: []
  },
  reducers: {
    addComboToCart: (state, action) => {
      state.items.push({
        type: "combo",
        ...action.payload,
        qty: 1
      });
    }
  }
});

export const { addComboToCart } = cartSlice.actions;
export default cartSlice.reducer;