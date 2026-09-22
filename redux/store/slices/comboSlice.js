import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

/* ================= SLICE ================= */
const comboSlice = createSlice({
  name: 'combo',
  initialState: {
    loading: false,
    success: false,
    error: null,
    combos: [],
    combo: {},
  },

  reducers: {
    resetCombo(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    removeCombo: (state, action) => {
      state.combos = state.combos.filter(
        (combo) => combo._id !== action.payload
      );
    },
    setSingleCombo: (state, action) => {
      state.combo = action.payload.combos;
    },
    setCombos(state, action) {
      state.combos = action.payload;
    },
    addCombo(state, action) {
      state.combos = [...state.combos, action.payload.combo];
    },
  },
  extraReducers: () => {},
});

export const { resetCombo, setCombos, setSingleCombo, addCombo, removeCombo } =
  comboSlice.actions;
export default comboSlice.reducer;
