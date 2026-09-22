import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTopics = createAsyncThunk("topics/fetch", async () => {
  const res = await fetch("/api/topics");
  return res.json();
});

export const addTopic = createAsyncThunk("topics/add", async (topic) => {
  const res = await fetch("/api/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(topic),
  });
  return res.json();
});

const topicSlice = createSlice({
  name: "topics",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addTopic.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default topicSlice.reducer;