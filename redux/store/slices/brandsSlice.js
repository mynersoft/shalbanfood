import { createSlice } from '@reduxjs/toolkit';


/* ================= SLICE ================= */
const brandSlice = createSlice({
  name: 'brand',
  initialState: {
    loading: false,
    success: false,
    error: null,
    brands: [],
    brand: {},
  },

  reducers: {
    removeBrand: (state, action) => {
      state.brands = state.brands.filter(
        (brand) => brand._id !== action.payload
      );
    },
    setBrands(state, action) {
      state.brands = action.payload.brands;
    },
    addBrand(state, action) {
      state.brands = [...state.brands, action.payload.brand];
    },
  },
  extraReducers: () => {},
});

export const { setBrands, addBrand, removeBrand } =
  brandSlice.actions;
export default brandSlice.reducer;
