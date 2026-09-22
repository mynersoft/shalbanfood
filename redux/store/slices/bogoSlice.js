import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* ================= SLICE ================= */
const bogoslice = createSlice({
  name: 'bogo',
  initialState: {
    loading: false,
    success: false,
    error: null,
    bogos: [],
    bogo: {},
  },

  reducers: {
    removeBogo: (state, action) => {
      state.bogos = state.bogos.filter((bogo) => bogo._id !== action.payload);
    },
    setSingleBogo: (state, action) => {
      state.bogo = action.payload;
    },
    setBogos(state, action) {
      state.bogos = action.payload;
    },
    addBogo(state, action) {
      state.bogos = [...state.bogos, action.payload];
    },
  },
  extraReducers: () => {},
});

export const { setBogos, setSingleBogo, addBogo, removeBogo } =
  bogoslice.actions;
export default bogoslice.reducer;
