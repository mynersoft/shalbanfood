import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/categories");

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch categories"
        );
      }

      return data.categories || [];
    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

// Add category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to add category"
        );
      }

      return data.category;
    } catch (error) {
      return rejectWithValue("Failed to add category");
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data: categoryData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to update category"
        );
      }

      return data.category;
    } catch (error) {
      return rejectWithValue("Failed to update category");
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to delete category"
        );
      }

      return id;
    } catch (error) {
      return rejectWithValue("Failed to delete category");
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",

  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })

      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;

        state.list.unshift(action.payload);
      })

      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;

        state.list = state.list.filter(
          (item) => item._id !== action.payload
        );
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;