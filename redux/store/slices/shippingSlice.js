import { createSlice } from "@reduxjs/toolkit";

const shippingSlice = createSlice({
  name: "shipping",
  initialState: {
    deliveryArea: "outsideDhaka",
  },
  reducers: {
    setDeliveryArea: (state, action) => {
      state.deliveryArea = action.payload;
    },
  },
});

export const { setDeliveryArea } = shippingSlice.actions;
export default shippingSlice.reducer;