import { createSlice } from '@reduxjs/toolkit';

/* ================= INITIAL STATE ================= */
const initialState = {
  vouchers: [],
  applyVoucher: null,
  loading: false,
  success: false,
  error: null,
};

/* ================= SLICE ================= */
const voucherSlice = createSlice({
  name: 'voucher',
  initialState,

  reducers: {
    /* SET ALL VOUCHERS */
    setVouchers(state, action) {
      state.vouchers = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.vouchers || [];
      state.loading = false;
      state.error = null;
    },

    /* ADD NEW VOUCHER */
    addVoucher(state, action) {
      const exists = state.vouchers.find((v) => v.code === action.payload.code);

      if (!exists) {
        state.vouchers.unshift(action.payload);
      }
    },
    applyVoucher(state, action) {
      
      state.applyVoucher = action.payload;
    },

    /* UPDATE VOUCHER */
    updateVoucher(state, action) {
      const index = state.vouchers.findIndex(
        (v) => v._id === action.payload._id
      );

      if (index !== -1) {
        state.vouchers[index] = action.payload;
      }
    },

    removeVoucher: (state, action) => {
      state.vouchers = state.vouchers.filter(
        (voucher) => voucher._id !== action.payload
      );
    },

    /* RESET */
    resetVoucherState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  setVouchers,
  addVoucher,
  removeVoucher,
  applyVoucher,
  updateVoucher,
  deleteVoucher,
  voucherRequest,

  voucherSuccess,
  voucherFail,
  resetVoucherState,
} = voucherSlice.actions;

export default voucherSlice.reducer;
