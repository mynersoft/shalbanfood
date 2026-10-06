'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import axios from 'axios';

const API_URL = '/api/categories';

// ==========================================
// ERROR HELPER
// ==========================================

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

// ==========================================
// FETCH CATEGORIES
// ==========================================

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],

        queryFn: async () => {
            const response =
                await axios.get(API_URL);

            return Array.isArray(
                response.data?.categories
            )
                ? response.data.categories
                : [];
        },

        staleTime: 5 * 60 * 1000,
    });
};

// ==========================================
// ADD CATEGORY
// ==========================================

export const useAddCategory = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            try {
                const response =
                    await axios.post(
                        API_URL,
                        data
                    );

                return response.data?.category;
            } catch (error) {
                throw new Error(
                    getErrorMessage(
                        error,
                        'Failed to create category'
                    )
                );
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
};

// ==========================================
// UPDATE CATEGORY
// ==========================================

export const useUpdateCategory = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...data
        }) => {
            if (!id) {
                throw new Error(
                    'Category ID is required'
                );
            }

            try {
                const response =
                    await axios.put(
                        `${API_URL}/${id}`,
                        data
                    );

                return (
                    response.data?.category ||
                    response.data?.data ||
                    response.data
                );
            } catch (error) {
                throw new Error(
                    getErrorMessage(
                        error,
                        'Failed to update category'
                    )
                );
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
};

// ==========================================
// DELETE CATEGORY
// ==========================================

export const useDeleteCategory = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            if (!id) {
                throw new Error(
                    'Category ID is required'
                );
            }

            try {
                await axios.delete(
                    `${API_URL}/${id}`
                );

                return id;
            } catch (error) {
                throw new Error(
                    getErrorMessage(
                        error,
                        'Failed to delete category'
                    )
                );
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
};

// ==========================================
// ADD SUBCATEGORY
// ==========================================

export const useAddSubCategory = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async ({
            parentId,
            subCategoryData,
        }) => {
            if (!parentId) {
                throw new Error(
                    'Parent category is required'
                );
            }

            if (
                !subCategoryData?.name?.trim()
            ) {
                throw new Error(
                    'Subcategory name is required'
                );
            }

            try {
                const response =
                    await axios.post(
                        `${API_URL}/${parentId}/subcategories`,
                        {
                            name: subCategoryData.name.trim(),
                        }
                    );

                return (
                    response.data?.category ||
                    response.data
                );
            } catch (error) {
                throw new Error(
                    getErrorMessage(
                        error,
                        'Failed to add subcategory'
                    )
                );
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
};

// ==========================================
// DELETE SUBCATEGORY
// ==========================================

export const useDeleteSubCategory = () => {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async ({
            parentId,
            subCategory,
        }) => {
            if (!parentId) {
                throw new Error(
                    'Parent category is required'
                );
            }

            if (!subCategory) {
                throw new Error(
                    'Subcategory is required'
                );
            }

            try {
                await axios.delete(
                    `${API_URL}/${parentId}/subcategories`,
                    {
                        data: {
                            name: subCategory,
                        },
                    }
                );

                return {
                    parentId,
                    subCategory,
                };
            } catch (error) {
                throw new Error(
                    getErrorMessage(
                        error,
                        'Failed to delete subcategory'
                    )
                );
            }
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['categories'],
            });
        },
    });
};