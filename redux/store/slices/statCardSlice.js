import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  statcards: [],
};

const statCardSlice = createSlice({
  name: 'statcard',
  initialState,
  reducers: {
    setStatcards(state, action) {
      state.statcards = action.payload;
    },
  },
});

export const { setStatcards } = statCardSlice.actions;
export default statCardSlice.reducer;
