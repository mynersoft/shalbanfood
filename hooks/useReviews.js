import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Fetch reviews for a product
export const useProductReviews = (productId, options = {}) => {
  const { page = 1, sort = 'newest', rating = 'all', enabled = true } = options;

  return useQuery({
    queryKey: ['reviews', productId, { page, sort, rating }],
    queryFn: async () => {
      const { data } = await axios.get('/api/reviews', {
        params: { productId, page, sort, rating }
      });
      return data;
    },
    enabled: !!productId && enabled,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create a review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await axios.post('/api/reviews', reviewData);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['reviews', variables.productId]);
      queryClient.invalidateQueries(['products', variables.productId]);
    },
    onError: (error) => {
      console.error('Error creating review:', error);
    }
  });
};

// Update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...reviewData }) => {
      const { data } = await axios.put(`/api/reviews/${id}`, reviewData);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.setQueryData(
        ['reviews', data.data.productId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map(review => 
              review._id === data.data._id ? data.data : review
            )
          };
        }
      );
    }
  });
};

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }) => {
      const { data } = await axios.delete(`/api/reviews/${id}`, { 
        data: { userId } 
      });
      return { id, ...data };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['products']);
    }
  });
};

// Get review statistics
export const useReviewStats = (productId) => {
  return useQuery({
    queryKey: ['reviewStats', productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/reviews/stats?productId=${productId}`);
      return data;
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};