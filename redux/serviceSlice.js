import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ================================
// FETCH SERVICES (WITH STATS)
// ================================
export const fetchServices = createAsyncThunk(
  "service/fetchServices",
  async ({ type }) => {
    const res = await axios.get(`/api/service?type=${type}`);
    return res.data;
  }
);

// ================================
// OTHER SERVICE CRUD
// ================================
export const deleteService = createAsyncThunk(
  "service/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/service/${id}`);
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const addService = createAsyncThunk(
  "service/addService",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/service", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const updateService = createAsyncThunk(
  "service/updateService",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/service/${id}`, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// ================================
// INITIAL STATE
// ================================
const slice = createSlice({
  name: "service",
  initialState: {
    list: [],
    total: 0,
    loading: false,
    error: null,

    // Pagination
    page: 1,
    limit: 50,

    // 👇 NEW: Current month stats
    totalServices: 0,
    totalBill: 0,

    // 👇 NEW: Last month stats
    lastMonth: {
      totalServices: 0,
      totalBill: 0,
      dateRange: null,
    },
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // ==========================
      // FETCH SERVICES
      // ==========================
      .addCase(fetchServices.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchServices.fulfilled, (s, a) => {
        s.loading = false;

        const p = a.payload;

        // List + Pagination
        s.list = p.list || [];
        s.total = p.total || 0;
        s.page = p.page || 1;
        s.limit = p.limit || 50;

        // 🌟 Current month stats
        s.totalServices = p.totalServices || 0;
        s.totalBill = p.totalBill || 0;

        // 🌟 Last month stats
        if (p.lastMonth) {
          s.lastMonth = p.lastMonth;
        }
      })
      .addCase(fetchServices.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload?.message || a.error?.message;
      })

      // ==========================
      // ADD SERVICE
      // ==========================
      .addCase(addService.fulfilled, (s, a) => {
        if (a.payload.record) {
          s.list.push(a.payload.record);
          s.total += 1;
        }
      })

      // ==========================
      // DELETE
      // ==========================
      .addCase(deleteService.fulfilled, (s, a) => {
        s.list = s.list.filter((i) => i._id !== a.payload.id);
        s.total -= 1;
      })

      // ==========================
      // UPDATE
      // ==========================
      .addCase(updateService.fulfilled, (s, a) => {
        if (a.payload.record) {
          s.list = s.list.map((it) =>
            it._id === a.payload.record._id ? a.payload.record : it
          );
        }
      });
  },
});

export default slice.reducer;