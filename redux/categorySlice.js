import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

// ========================================
// FETCH CATEGORIES
// ========================================
export const fetchCategories = createAsyncThunk(
	'categories/fetchCategories',
	async (_, { rejectWithValue }) => {
		try {
			const res = await axios.get('/api/categories');

			return res.data;
		} catch (error) {
			return rejectWithValue(
				error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'Failed to fetch categories'
			);
		}
	}
);

// ========================================
// ADD CATEGORY
// ========================================
export const addCategory = createAsyncThunk(
	'categories/addCategory',
	async (payload, { rejectWithValue }) => {
		try {
			const res = await axios.post('/api/categories', payload, {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			return res.data?.category || res.data;
		} catch (error) {
			console.error('addCategory:', error?.response?.data || error);

			return rejectWithValue(
				error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'Failed to create category'
			);
		}
	}
);

// ========================================
// UPDATE CATEGORY
// ========================================
export const updateCategory = createAsyncThunk(
	'categories/updateCategory',
	async ({ id, ...data }, { rejectWithValue }) => {
		try {
			if (!id) {
				return rejectWithValue('Category ID is required');
			}

			const res = await axios.put(`/api/categories/${id}`, data, {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			return res.data?.category || res.data;
		} catch (error) {
			console.error('updateCategory:', error?.response?.data || error);

			return rejectWithValue(
				error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'Failed to update category'
			);
		}
	}
);

// ========================================
// DELETE CATEGORY
// ========================================
export const deleteCategory = createAsyncThunk(
	'categories/deleteCategory',
	async (id, { rejectWithValue }) => {
		try {
			if (!id) {
				return rejectWithValue('Category ID is required');
			}

			await axios.delete(`/api/categories/${id}`);

			return id;
		} catch (error) {
			console.error('deleteCategory:', error?.response?.data || error);

			return rejectWithValue(
				error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'Failed to delete category'
			);
		}
	}
);

// ========================================
// INITIAL STATE
// ========================================
const initialState = {
	list: [],
	loading: false,
	saving: false,
	deleting: false,
	error: null,
};

// ========================================
// SLICE
// ========================================
const categorySlice = createSlice({
	name: 'categories',

	initialState,

	reducers: {
		clearCategoryError: (state) => {
			state.error = null;
		},
	},

	extraReducers: (builder) => {
		builder

			// ========================================
			// FETCH
			// ========================================
			.addCase(fetchCategories.pending, (state) => {
				state.loading = true;
				state.error = null;
			})

			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.list = Array.isArray(action.payload)
					? action.payload
					: [];

				state.loading = false;
				state.error = null;
			})

			.addCase(fetchCategories.rejected, (state, action) => {
				state.loading = false;
				state.error =
					action.payload ||
					action.error.message ||
					'Failed to fetch categories';
			})

			// ========================================
			// ADD
			// ========================================
			.addCase(addCategory.pending, (state) => {
				state.saving = true;
				state.error = null;
			})

			.addCase(addCategory.fulfilled, (state, action) => {
				if (action.payload) {
					state.list.unshift(action.payload);
				}

				state.saving = false;
				state.error = null;
			})

			.addCase(addCategory.rejected, (state, action) => {
				state.saving = false;
				state.error =
					action.payload ||
					action.error.message ||
					'Failed to create category';
			})

			// ========================================
			// UPDATE
			// ========================================
			.addCase(updateCategory.pending, (state) => {
				state.saving = true;
				state.error = null;
			})

			.addCase(updateCategory.fulfilled, (state, action) => {
				const updated = action.payload;

				if (updated?._id) {
					state.list = state.list.map((category) =>
						category._id === updated._id ? updated : category
					);
				}

				state.saving = false;
				state.error = null;
			})

			.addCase(updateCategory.rejected, (state, action) => {
				state.saving = false;
				state.error =
					action.payload ||
					action.error.message ||
					'Failed to update category';
			})

			// ========================================
			// DELETE
			// ========================================
			.addCase(deleteCategory.pending, (state) => {
				state.deleting = true;
				state.error = null;
			})

			.addCase(deleteCategory.fulfilled, (state, action) => {
				state.list = state.list.filter(
					(category) => category._id !== action.payload
				);

				state.deleting = false;
				state.error = null;
			})

			.addCase(deleteCategory.rejected, (state, action) => {
				state.deleting = false;
				state.error =
					action.payload ||
					action.error.message ||
					'Failed to delete category';
			});
	},
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;
