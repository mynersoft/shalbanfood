import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, sort = 'newest', rating = 'all' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/reviews`, {
        params: { productId, page, sort, rating }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, ...reviewData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/reviews/${id}`, { data: { userId } });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    stats: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalReviews: 0,
      hasMore: false
    },
    filters: {
      sort: 'newest',
      rating: 'all'
    },
    loading: false,
    error: null,
    submitting: false,
    submitError: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    resetReviews: (state) => {
      state.reviews = [];
      state.stats = null;
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalReviews: 0,
        hasMore: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.reviews.unshift(action.payload.data);
        state.stats = action.payload.stats;
        state.pagination.totalReviews += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(review => review._id === action.payload.data._id);
        if (index !== -1) {
          state.reviews[index] = action.payload.data;
        }
        state.stats = action.payload.stats;
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(review => review._id !== action.payload.id);
        state.pagination.totalReviews -= 1;
      });
  }
});

export const { setFilters, clearError, resetReviews } = reviewSlice.actions;
export default reviewSlice.reducer;