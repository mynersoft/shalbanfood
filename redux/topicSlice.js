// redux/topicSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTopics = createAsyncThunk("topics/fetch", async () => {
  const res = await fetch("/api/topics");
  if (!res.ok) throw new Error("Failed to fetch topics");
  return await res.json();
});

export const addTopic = createAsyncThunk("topics/add", async (topic) => {
  const res = await fetch("/api/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(topic),
  });
  if (!res.ok) throw new Error("Failed to add topic");
  return await res.json();
});

const slice = createSlice({
  name: "topics",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTopics.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchTopics.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchTopics.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
     .addCase(addTopic.fulfilled, (s, a) => { s.items.unshift(a.payload); });
  },
});

export default slice.reducer;