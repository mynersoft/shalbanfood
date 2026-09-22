import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBrands = createAsyncThunk("brands/fetch", async () => {
  const res = await fetch("/api/brands");
  return await res.json();
});

const brandsSlice = createSlice({
  name: "brands",
  initialState: { items: [] },
  extraReducers: (builder) => {
    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export default brandsSlice.reducer;