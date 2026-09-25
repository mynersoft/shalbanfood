'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';

import {
	fetchCategories,
	addCategory,
	updateCategory,
	deleteCategory,
} from '@/redux/store/slices/categorySlice';

const API_URL = '/api/categories';

// ========================================
// GET ALL CATEGORIES
// ========================================
export const useCategories = () => {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['categories'],

		queryFn: async () => {
			const result = await dispatch(fetchCategories()).unwrap();

			return Array.isArray(result) ? result : [];
		},

		staleTime: 5 * 60 * 1000,
	});
};

// ========================================
// ADD CATEGORY
// ========================================
export const useAddCategory = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (categoryData) => {
			const result = await dispatch(addCategory(categoryData)).unwrap();

			return result;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});
		},
	});
};

// ========================================
// ADD SUBCATEGORY
// ========================================
// Only keep this if your API supports:
// POST /api/categories/:parentId/subcategories
export const useAddSubCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ parentId, subCategoryData }) => {
			if (!parentId) {
				throw new Error('Parent category ID is required');
			}

			const { data } = await axios.post(
				`${API_URL}/${parentId}/subcategories`,
				subCategoryData
			);

			return data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});
		},
	});
};

// ========================================
// UPDATE CATEGORY
// ========================================
export const useUpdateCategory = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...data }) => {
			if (!id) {
				throw new Error('Category ID is required');
			}

			const result = await dispatch(
				updateCategory({
					id,
					...data,
				})
			).unwrap();

			return result;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});
		},
	});
};

// ========================================
// DELETE CATEGORY
// ========================================
export const useDeleteCategory = () => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id) => {
			if (!id) {
				throw new Error('Category ID is required');
			}

			return await dispatch(deleteCategory(id)).unwrap();
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});
		},
	});
};

// ========================================
// DELETE SUBCATEGORY
// ========================================
export const useDeleteSubCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ slug }) => {
			if (!slug) {
				throw new Error('Subcategory slug is required');
			}

			const { data } = await axios.delete(
				`${API_URL}/subcategories/${slug}`
			);

			return data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['categories'],
			});
		},
	});
};
