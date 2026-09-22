import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch products (with backend totalAmount)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 1, limit = 500 } = {}) => {
    const res = await axios.get(`/api/products?page=${page}&limit=${limit}`);
    return res.data; // {success, products, totalAmount}
  }
);

// Add product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (payload) => {
    const res = await axios.post("/api/products", payload);
    return res.data;
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (payload) => {
    const res = await axios.put("/api/products", payload);
    return res.data;
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    await axios.delete(`/api/products?id=${id}`);
    return id;
  }
);



export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async () => {
    const res = await fetch("/api/getbycat");
    const data = await res.json();
    return data.categories || {};
  }
);





export const fetchBestSelling = createAsyncThunk(
  "products/fetchBestSelling",
  async () => {
    const res = await axios.get("/api/products/best-selling");
    return res.data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
    totalAmount: 0,
    bestSelling: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // ===================== FETCH =====================
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
        state.totalAmount = action.payload.totalAmount || 0; // backend amount
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ===================== ADD =====================
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // ===================== UPDATE =====================
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })

      // ===================== DELETE =====================
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })

      // ===================== BEST SELLING =====================
      .addCase(fetchBestSelling.fulfilled, (state, action) => {
        state.bestSelling = action.payload;
      }).addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;