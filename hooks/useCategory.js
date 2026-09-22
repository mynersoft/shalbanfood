import { setCategories } from '@/store/slices/categorySlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';

const API_URL = '/api/categories';

// Get all categories with subcategories
export const useCategories = () => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(API_URL);
        dispatch(setCategories(data));
        return data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Return empty array on error
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};




// Add main category
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData) => {
      const { data } = await axios.post(API_URL, categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

// Add subcategory (this can also handle nested subcategories)
export const useAddSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ parentId, subCategoryData }) => {
      const { data } = await axios.post(
        `${API_URL}/${parentId}/subcategories`,
        subCategoryData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

// Delete subcategory
export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, parentId }) => {
      await axios.delete(`${API_URL}/subcategories/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

// Update category (if needed)
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};
