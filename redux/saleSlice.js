// redux/sellSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSale = createAsyncThunk("sale/fetch", async () => {
	const res = await axios.get("/api/sale");
	return res.data;
});

export const addSale = createAsyncThunk("sale/add", async (payload) => {
	const res = await axios.post("/api/sale", payload);
	return res.data;
});

export const fetchSingleSale = createAsyncThunk(
	"sale/fetchSingle",
	async (id) => {
		const res = await axios.get(`/api/sale/${id}`);
		return res.data;
	}
);


export const deleteSale = createAsyncThunk(
	"sale/deleteSale",
	async (id, { rejectWithValue }) => {
		try {
			const res = await axios.delete(`/api/sale/${id}`);
			return { id, ...res.data };
		} catch (err) {
			return rejectWithValue(err.response.data);
		}
	}
);






const saleSlice = createSlice({
	name: "sale",
	initialState: {
		items: [],
		singleSale: null,
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSale.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchSale.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload.sales;
			})
			.addCase(fetchSale.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error?.message || "Fetch failed";
			})

			.addCase(addSale.fulfilled, (state, action) => {
				state.items.unshift(action.payload);
			})
			.addCase(addSale.rejected, (state, action) => {
				state.error = action.error?.message || "Save failed";
			})
			.addCase(fetchSingleSale.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchSingleSale.fulfilled, (state, action) => {
				state.loading = false;
				state.singleSale = action.payload;
			})
			.addCase(fetchSingleSale.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message;
			})
			.addCase(deleteSale.pending, (state) => {
				state.loading = true;
			})
			.addCase(deleteSale.fulfilled, (state, action) => {
				state.items = state.items.filter(
					(sale) => sale._id !== action.payload.id
				);
				state.loading = false;
			})
			.addCase(deleteSale.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message;
			});
	},
});

export default saleSlice.reducer;
