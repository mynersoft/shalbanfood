import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

/* ================= SLICE ================= */
const orderSlice = createSlice({
  name: 'order',
  initialState: {
    loading: false,
    success: false,
    error: null,
    orders: [],
    order: {},
  },

  reducers: {
    resetOrder(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    removeOrder: (state, action) => {
      state.orders = state.orders.filter(
        (order) => order._id !== action.payload
      );
    },
    setSingleOrder: (state, action) => {
      state.order = action.payload.orders;
    },
    setOrders(state, action) {
      state.orders = action.payload.orders;
    },
    addOrder(state, action) {
      state.orders = [...state.orders,action.payload.order];
    },
  },
  extraReducers: () => {},
});

export const { resetOrder, setOrders, setSingleOrder, addOrder, removeOrder } =
  orderSlice.actions;
export default orderSlice.reducer;
