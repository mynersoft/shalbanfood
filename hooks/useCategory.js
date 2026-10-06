"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { useDispatch } from "react-redux";

import {
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} from "@/redux/store/slices/categorySlice";

// ========================================
// GET CATEGORIES
// ========================================

export const useCategories = () => {
    const dispatch = useDispatch();

    return useQuery({
        queryKey: ["categories"],

        queryFn: async () => {
            const result =
                await dispatch(
                    fetchCategories()
                ).unwrap();

            return Array.isArray(result)
                ? result
                : [];
        },

        staleTime:
            5 * 60 * 1000,

        refetchOnWindowFocus: false,
    });
};

// ========================================
// ADD CATEGORY
// ========================================

export const useAddCategory = () => {
    const dispatch = useDispatch();
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (
            payload
        ) => {
            return await dispatch(
                addCategory(payload)
            ).unwrap();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
    });
};

// ========================================
// UPDATE CATEGORY
// ========================================

export const useUpdateCategory = () => {
    const dispatch = useDispatch();
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (
            payload
        ) => {
            return await dispatch(
                updateCategory(payload)
            ).unwrap();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
    });
};

// ========================================
// DELETE CATEGORY
// ========================================

export const useDeleteCategory = () => {
    const dispatch = useDispatch();
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            return await dispatch(
                deleteCategory(id)
            ).unwrap();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["categories"],
            });
        },
    });
};