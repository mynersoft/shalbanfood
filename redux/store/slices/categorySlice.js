import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import axios from "axios";

// ========================================
// ERROR HELPER
// ========================================

const getErrorMessage = (
    error,
    fallback
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
};

// ========================================
// FETCH
// ========================================

export const fetchCategories =
    createAsyncThunk(
        "categories/fetchCategories",
        async (_, { rejectWithValue }) => {
            try {
                const res =
                    await axios.get(
                        "/api/categories"
                    );

                return (
                    res.data?.categories ||
                    []
                );
            } catch (error) {
                return rejectWithValue(
                    getErrorMessage(
                        error,
                        "Failed to fetch categories"
                    )
                );
            }
        }
    );

// ========================================
// ADD
// ========================================

export const addCategory =
    createAsyncThunk(
        "categories/addCategory",
        async (
            payload,
            { rejectWithValue }
        ) => {
            try {
                const res =
                    await axios.post(
                        "/api/categories",
                        payload
                    );

                return res.data?.category;
            } catch (error) {
                return rejectWithValue(
                    getErrorMessage(
                        error,
                        "Failed to create category"
                    )
                );
            }
        }
    );

// ========================================
// UPDATE
// ========================================

export const updateCategory =
    createAsyncThunk(
        "categories/updateCategory",
        async (
            { id, ...data },
            { rejectWithValue }
        ) => {
            try {
                if (!id) {
                    return rejectWithValue(
                        "Category ID is required"
                    );
                }

                const res =
                    await axios.put(
                        `/api/categories/${id}`,
                        data
                    );

                return (
                    res.data?.category ||
                    res.data?.data ||
                    res.data
                );
            } catch (error) {
                return rejectWithValue(
                    getErrorMessage(
                        error,
                        "Failed to update category"
                    )
                );
            }
        }
    );

// ========================================
// DELETE
// ========================================

export const deleteCategory =
    createAsyncThunk(
        "categories/deleteCategory",
        async (
            id,
            { rejectWithValue }
        ) => {
            try {
                if (!id) {
                    return rejectWithValue(
                        "Category ID is required"
                    );
                }

                await axios.delete(
                    `/api/categories/${id}`
                );

                return id;
            } catch (error) {
                return rejectWithValue(
                    getErrorMessage(
                        error,
                        "Failed to delete category"
                    )
                );
            }
        }
    );

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
    categories: [],
    loading: false,
    saving: false,
    deleting: false,
    error: null,
};

// ========================================
// SLICE
// ========================================

const categorySlice = createSlice({
    name: "categories",

    initialState,

    reducers: {
        clearCategoryError: (
            state
        ) => {
            state.error = null;
        },

        clearCategories: (
            state
        ) => {
            state.categories = [];
        },

        resetCategoryState: () =>
            initialState,
    },

    extraReducers: (builder) => {
        builder

            // ==================================
            // FETCH
            // ==================================

            .addCase(
                fetchCategories.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchCategories.fulfilled,
                (
                    state,
                    action
                ) => {
                    // IMPORTANT:
                    // thunk returns ARRAY directly
                    state.categories =
                        Array.isArray(
                            action.payload
                        )
                            ? action.payload
                            : [];

                    state.loading = false;
                    state.error = null;
                }
            )

            .addCase(
                fetchCategories.rejected,
                (
                    state,
                    action
                ) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        action.error?.message ||
                        "Failed to fetch categories";
                }
            )

            // ==================================
            // ADD
            // ==================================

            .addCase(
                addCategory.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                addCategory.fulfilled,
                (
                    state,
                    action
                ) => {
                    if (
                        action.payload
                    ) {
                        state.categories.unshift(
                            action.payload
                        );
                    }

                    state.saving = false;
                    state.error = null;
                }
            )

            .addCase(
                addCategory.rejected,
                (
                    state,
                    action
                ) => {
                    state.saving = false;

                    state.error =
                        action.payload ||
                        action.error?.message ||
                        "Failed to create category";
                }
            )

            // ==================================
            // UPDATE
            // ==================================

            .addCase(
                updateCategory.pending,
                (state) => {
                    state.saving = true;
                    state.error = null;
                }
            )

            .addCase(
                updateCategory.fulfilled,
                (
                    state,
                    action
                ) => {
                    const updated =
                        action.payload;

                    if (
                        updated?._id
                    ) {
                        const index =
                            state.categories.findIndex(
                                (
                                    category
                                ) =>
                                    category._id ===
                                    updated._id
                            );

                        if (
                            index !== -1
                        ) {
                            state.categories[
                                index
                            ] = updated;
                        }
                    }

                    state.saving = false;
                    state.error = null;
                }
            )

            .addCase(
                updateCategory.rejected,
                (
                    state,
                    action
                ) => {
                    state.saving = false;

                    state.error =
                        action.payload ||
                        action.error?.message ||
                        "Failed to update category";
                }
            )

            // ==================================
            // DELETE
            // ==================================

            .addCase(
                deleteCategory.pending,
                (state) => {
                    state.deleting = true;
                    state.error = null;
                }
            )

            .addCase(
                deleteCategory.fulfilled,
                (
                    state,
                    action
                ) => {
                    state.categories =
                        state.categories.filter(
                            (
                                category
                            ) =>
                                category._id !==
                                action.payload
                        );

                    state.deleting = false;
                    state.error = null;
                }
            )

            .addCase(
                deleteCategory.rejected,
                (
                    state,
                    action
                ) => {
                    state.deleting = false;

                    state.error =
                        action.payload ||
                        action.error?.message ||
                        "Failed to delete category";
                }
            );
    },
});

// ========================================
// ACTIONS
// ========================================

export const {
    clearCategoryError,
    clearCategories,
    resetCategoryState,
} = categorySlice.actions;

// ========================================
// SELECTORS
// ========================================

export const selectCategories = (
    state
) =>
    state.category?.categories || [];

export const selectCategoryLoading = (
    state
) =>
    state.category?.loading || false;

export const selectCategorySaving = (
    state
) =>
    state.category?.saving || false;

export const selectCategoryDeleting = (
    state
) =>
    state.category?.deleting || false;

export const selectCategoryError = (
    state
) =>
    state.category?.error || null;

// ========================================
// REDUCER
// ========================================

export default categorySlice.reducer;