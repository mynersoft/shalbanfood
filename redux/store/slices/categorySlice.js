import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.categories = [];
    },
    clearCategories: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setCategories, setLoading, setError, clearCategories } =
  categorySlice.actions;
export default categorySlice.reducer;
