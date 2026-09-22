import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Get all
export const fetchInvests = createAsyncThunk("invest/fetch", async () => {
  const res = await fetch("/api/invest");
  return res.json();
});

// Add
export const addInvest = createAsyncThunk("invest/add", async (data) => {
  const res = await fetch("/api/invest", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
});

// Update
export const updateInvest = createAsyncThunk("invest/update", async (data) => {
  const res = await fetch("/api/invest?id=" + data._id, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
});

// Delete
export const deleteInvest = createAsyncThunk(
  "invest/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/invest?id=" + id, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || "Delete failed");
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


const investSlice = createSlice({
  name: "invest",
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
    filterType: "all",

    // API TOTALS
    toolsAmount: 0,
    malamalAmount: 0,
    totalInvest: 0,
    finalTotalInvest: 0,
  },

  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
  },

  extraReducers: (builder) => {
    // LOAD LIST
    builder
      .addCase(fetchInvests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvests.fulfilled, (state, action) => {
        state.loading = false;

        const p = action.payload;

        state.list = p.items || [];

        // Save totals
        state.toolsAmount = p.toolsAmount || 0;
        state.malamalAmount = p.malamalsAmount || 0;
        state.totalInvest = p.totalInvest || 0;
        state.finalTotalInvest = p.finalTotalInvest || 0;
      });

    // ADD
    builder
      .addCase(addInvest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addInvest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload); // API returns created object directly
      });

    // UPDATE
    builder
      .addCase(updateInvest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateInvest.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        state.list = state.list.map((i) => (i._id === updated._id ? updated : i));
      });

    // DELETE
    builder
      .addCase(deleteInvest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteInvest.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedId = action.payload;
        state.list = state.list.filter((i) => i._id !== deletedId);
      });
  },
});

export const { setFilterType } = investSlice.actions;
export default investSlice.reducer;