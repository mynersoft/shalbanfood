import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API base URL
const BASE_URL = "/api/bills";

// Thunks
export const fetchBills = createAsyncThunk("bills/fetch", async () => {
  const res = await fetch(BASE_URL);
  return res.json();
});

export const addBill = createAsyncThunk("bills/add", async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
});

export const updateBill = createAsyncThunk("bills/update", async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
});

export const deleteBill = createAsyncThunk("bills/delete", async (_id) => {
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id }),
  });
  if (!res.ok) throw await res.json();
  return _id;
});

// Slice
const billSlice = createSlice({
  name: "bills",
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => { state.loading = true; })
      .addCase(fetchBills.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchBills.rejected, (state, action) => { state.loading = false; state.error = action.error; })

      .addCase(addBill.pending, (state) => { state.actionLoading = true; })
      .addCase(addBill.fulfilled, (state, action) => { state.actionLoading = false; state.list.unshift(action.payload); })
      .addCase(addBill.rejected, (state, action) => { state.actionLoading = false; state.error = action.error; })

      .addCase(updateBill.pending, (state) => { state.actionLoading = true; })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.actionLoading = false;
        const idx = state.list.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateBill.rejected, (state, action) => { state.actionLoading = false; state.error = action.error; })

      .addCase(deleteBill.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => { state.actionLoading = false; state.error = action.error; });
  },
});

export default billSlice.reducer;