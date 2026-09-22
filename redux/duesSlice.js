import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all dues
export const fetchDues = createAsyncThunk("dues/fetchDues", async () => {
	const res = await axios.get("/api/dues");
	return res.data;
});

// Add due
export const addDue = createAsyncThunk("dues/addDue", async (data) => {
	const res = await axios.post("/api/dues", data);
	return res.data;
});

// Pay due
export const payDue = createAsyncThunk(
	"dues/payDue",
	async ({ id, amount }) => {
		const res = await axios.put(`/api/dues/${id}`, { amount });
		return res.data.updated; // IMPORTANT
	}
);

// Delete due
export const deleteDue = createAsyncThunk("dues/deleteDue", async (id) => {
	await axios.delete(`/api/dues/${id}`);
	return id;
});

const duesSlice = createSlice({
	name: "dues",
	initialState: {
		items: [],
		loading: false,
	},

	extraReducers: (builder) => {
		builder

			// Fetch
			.addCase(fetchDues.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchDues.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})

			// Add
			.addCase(addDue.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})

			// Pay
			.addCase(payDue.fulfilled, (state, action) => {
				const updated = action.payload;
				const index = state.items.findIndex(
					(d) => d._id === updated._id
				);

				if (index !== -1) {
					state.items[index] = updated; // UI UPDATE FIXED 🚀
				}
			})

			// Delete
			.addCase(deleteDue.fulfilled, (state, action) => {
				state.items = state.items.filter(
					(d) => d._id !== action.payload
				);
			});
	},
});

export default duesSlice.reducer;
