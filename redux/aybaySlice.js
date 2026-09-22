import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAyBay = createAsyncThunk(
  "aybay/fetch",
  async () => {
    const res = await fetch("/api/aybay");
    const json = await res.json();
    return json.data; // ✅ array
  }
);

export const addAyBay = createAsyncThunk(
  "aybay/add",
  async (data) => {
    const res = await fetch("/api/aybay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data; // ✅ single object
  }
);


export const updateAyBay = createAsyncThunk(
  "aybay/update",
  async ({ id, data }) => {
    const res = await fetch(`/api/aybay/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Update failed");
    }

    return await res.json();
  }
);
export const deleteAyBay = createAsyncThunk(
  "aybay/delete",
  async (id) => {
    await fetch(`/api/aybay/${id}`, { method: "DELETE" });
    return id;
  }
);

const aybaySlice = createSlice({
  name: "aybay",
  initialState: {
    list: [], // ✅ always array
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAyBay.fulfilled, (state, action) => {
        state.list = action.payload;
      }).addCase(updateAyBay.fulfilled, (state, action) => {
  const index = state.list.findIndex(
    (i) => i._id === action.payload._id
  );
  if (index !== -1) state.list[index] = action.payload;
})

.addCase(deleteAyBay.fulfilled, (state, action) => {
  state.list = state.list.filter(
    (i) => i._id !== action.payload
  );
})
      .addCase(addAyBay.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default aybaySlice.reducer;