import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "/api/transactions";

// GET All
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async () => {
    const res = await fetch(API);
    return res.json();
  }
);

// ADD
export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (payload) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
);

// UPDATE
export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, changes }) => {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    return res.json();
  }
);

// DELETE
export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id) => {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });
    return res.json();
  }
);

const slice = createSlice({
  name: "transactions",
  initialState: {
    items: [],
    filterType: "all", // all, invest, ay
  },

  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    builder.addCase(addTransaction.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    builder.addCase(updateTransaction.fulfilled, (state, action) => {
      const idx = state.items.findIndex((i) => i._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    });

    builder.addCase(deleteTransaction.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload._id);
    });
  },
});

export const { setFilterType } = slice.actions;
export default slice.reducer;