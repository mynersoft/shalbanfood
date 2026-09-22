import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  fetchQuestions,
  addQuestion,
  addAnswer,
  markBestAnswer,
  voteQuestion,
  voteAnswer,
} from '@/store/slices/questionsSlice';

// Create axios instance with auth token
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// React Query Hooks
export const useQuestions = (productId, options = {}) => {
  const dispatch = useDispatch();
  const { filters, pagination } = useSelector((state) => state.questions);

  return useQuery({
    queryKey: ['questions', productId, filters, pagination],
    queryFn: async () => {
      const params = {
        productId,
        ...filters,
        ...pagination,
      };

      const response = await api.get('/questions', { params });
      return response.data;
    },
    enabled: !!productId,
    onSuccess: (data) => {
      // Sync with Redux
      dispatch(fetchQuestions.fulfilled(data));
    },
    ...options,
  });
};

export const useQuestion = (questionId) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    },
    enabled: !!questionId,
  });
};

export const useAddQuestion = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData) => {
      const response = await api.post('/questions', questionData);
      return response.data;
    },
    onMutate: async (newQuestion) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['questions', newQuestion.productId]);

      // Snapshot the previous value
      const previousQuestions = queryClient.getQueryData([
        'questions',
        newQuestion.productId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(['questions', newQuestion.productId], (old) => ({
        ...old,
        questions: [
          {
            _id: `temp-${Date.now()}`,
            ...newQuestion,
            createdAt: new Date().toISOString(),
            answers: [],
            status: 'pending',
          },
          ...(old?.questions || []),
        ],
      }));

      // Dispatch to Redux
      dispatch(addQuestion.pending());

      return { previousQuestions };
    },
    onSuccess: (data, variables, context) => {
      // Update the cache with the server response
      queryClient.setQueryData(['questions', variables.productId], (old) => ({
        ...old,
        questions: old?.questions?.map((q) =>
          q._id.startsWith('temp-') ? data : q
        ),
      }));

      // Invalidate and refetch
      queryClient.invalidateQueries(['questions', variables.productId]);

      // Dispatch to Redux
      dispatch(addQuestion.fulfilled(data));
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          ['questions', variables.productId],
          context.previousQuestions
        );
      }

      // Dispatch to Redux
      dispatch(addQuestion.rejected(err.message));
    },
  });
};

export const useAddAnswer = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answer }) => {
      const response = await api.post(`/questions/${questionId}/answers`, {
        answer,
      });
      return response.data;
    },
    onMutate: async ({ questionId, answer }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['questions']);
      await queryClient.cancelQueries(['question', questionId]);

      // Snapshot the previous values
      const previousQuestions = queryClient.getQueryData(['questions']);
      const previousQuestion = queryClient.getQueryData([
        'question',
        questionId,
      ]);

      // Optimistically update questions list
      if (previousQuestions) {
        queryClient.setQueryData(['questions'], (old) => ({
          ...old,
          questions: old?.questions?.map((q) => {
            if (q._id === questionId) {
              return {
                ...q,
                answers: [
                  ...q.answers,
                  {
                    _id: `temp-answer-${Date.now()}`,
                    answer,
                    userId: JSON.parse(localStorage.getItem('user')),
                    createdAt: new Date().toISOString(),
                  },
                ],
                status: 'answered',
              };
            }
            return q;
          }),
        }));
      }

      // Optimistically update single question
      if (previousQuestion) {
        queryClient.setQueryData(['question', questionId], (old) => ({
          ...old,
          answers: [
            ...old.answers,
            {
              _id: `temp-answer-${Date.now()}`,
              answer,
              userId: JSON.parse(localStorage.getItem('user')),
              createdAt: new Date().toISOString(),
            },
          ],
          status: 'answered',
        }));
      }

      return { previousQuestions, previousQuestion };
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      queryClient.setQueryData(['question', variables.questionId], data);
      queryClient.invalidateQueries(['questions']);

      // Dispatch to Redux
      dispatch(addAnswer.fulfilled(data));
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions'], context.previousQuestions);
      }
      if (context?.previousQuestion) {
        queryClient.setQueryData(
          ['question', variables.questionId],
          context.previousQuestion
        );
      }

      // Dispatch to Redux
      dispatch(addAnswer.rejected(err.message));
    },
  });
};

export const useMarkBestAnswer = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answerId }) => {
      const response = await api.patch(
        `/questions/${questionId}/answers/${answerId}/best`
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(['question', variables.questionId], data);
      queryClient.invalidateQueries(['questions']);

      // Dispatch to Redux
      dispatch(markBestAnswer.fulfilled(data));
    },
  });
};

export const useVote = (type = 'question') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, voteType, answerId }) => {
      if (type === 'question') {
        const response = await api.post(`/questions/${id}/vote`, { voteType });
        return response.data;
      } else {
        const response = await api.post(
          `/questions/${id}/answers/${answerId}/vote`,
          { voteType }
        );
        return response.data;
      }
    },
    onMutate: async ({ id, voteType, answerId }) => {
      await queryClient.cancelQueries(['questions']);
      await queryClient.cancelQueries(['question', id]);

      const previousQuestions = queryClient.getQueryData(['questions']);
      const previousQuestion = queryClient.getQueryData(['question', id]);

      // Optimistically update
      if (type === 'question') {
        if (previousQuestions) {
          queryClient.setQueryData(['questions'], (old) => ({
            ...old,
            questions: old?.questions?.map((q) => {
              if (q._id === id) {
                const currentVotes = q.votes || 0;
                return {
                  ...q,
                  votes:
                    voteType === 'up' ? currentVotes + 1 : currentVotes - 1,
                };
              }
              return q;
            }),
          }));
        }
      }

      return { previousQuestions, previousQuestion };
    },
    onError: (err, variables, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions'], context.previousQuestions);
      }
      if (context?.previousQuestion) {
        queryClient.setQueryData(
          ['question', variables.id],
          context.previousQuestion
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['questions']);
      queryClient.invalidateQueries(['question', variables.id]);
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId) => {
      await api.delete(`/questions/${questionId}`);
      return questionId;
    },
    onSuccess: (questionId) => {
      queryClient.invalidateQueries(['questions']);
    },
  });
};

export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, answerId }) => {
      await api.delete(`/questions/${questionId}/answers/${answerId}`);
      return { questionId, answerId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['questions']);
      queryClient.invalidateQueries(['question', data.questionId]);
    },
  });
};
