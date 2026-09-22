import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Async Thunks
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/questions?productId=${productId}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/questions/${questionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addQuestion = createAsyncThunk(
  'questions/addQuestion',
  async (questionData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Authentication required');
      }

      const response = await api.post('/questions', questionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addAnswer = createAsyncThunk(
  'questions/addAnswer',
  async ({ questionId, answerData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Authentication required');
      }

      const response = await api.post(
        `/questions/${questionId}/answers`,
        answerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAnswer = createAsyncThunk(
  'questions/updateAnswer',
  async ({ questionId, answerId, answerData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/questions/${questionId}/answers/${answerId}`,
        answerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markBestAnswer = createAsyncThunk(
  'questions/markBestAnswer',
  async ({ questionId, answerId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Authentication required');
      }

      const response = await api.patch(
        `/questions/${questionId}/answers/${answerId}/best`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const voteQuestion = createAsyncThunk(
  'questions/voteQuestion',
  async ({ questionId, voteType }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/questions/${questionId}/vote`, {
        voteType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const voteAnswer = createAsyncThunk(
  'questions/voteAnswer',
  async ({ questionId, answerId, voteType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/questions/${questionId}/answers/${answerId}/vote`,
        { voteType }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (questionId, { rejectWithValue }) => {
    try {
      await api.delete(`/questions/${questionId}`);
      return questionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAnswer = createAsyncThunk(
  'questions/deleteAnswer',
  async ({ questionId, answerId }, { rejectWithValue }) => {
    try {
      await api.delete(`/questions/${questionId}/answers/${answerId}`);
      return { questionId, answerId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const questionsSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [],
    currentQuestion: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      status: 'all', // all, answered, pending
      sortBy: 'newest', // newest, votes, unanswered
    },
    loading: false,
    error: null,
    operationLoading: false,
    operationError: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearQuestions: (state) => {
      state.questions = [];
      state.currentQuestion = null;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    addQuestionOptimistic: (state, action) => {
      state.questions.unshift(action.payload);
      state.pagination.total += 1;
    },
    addAnswerOptimistic: (state, action) => {
      const { questionId, answer } = action.payload;
      const question = state.questions.find((q) => q._id === questionId);
      if (question) {
        question.answers.push(answer);
        question.status = 'answered';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Question by ID
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Question
      .addCase(addQuestion.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.questions.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })

      // Add Answer
      .addCase(addAnswer.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(addAnswer.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.questions.findIndex(
          (q) => q._id === action.payload._id
        );
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(addAnswer.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })

      // Mark Best Answer
      .addCase(markBestAnswer.fulfilled, (state, action) => {
        const question = state.questions.find(
          (q) => q._id === action.payload._id
        );
        if (question) {
          question.answers = question.answers.map((answer) => ({
            ...answer,
            isBestAnswer: answer._id === action.payload.bestAnswerId,
          }));
        }
      })

      // Vote Question
      .addCase(voteQuestion.fulfilled, (state, action) => {
        const question = state.questions.find(
          (q) => q._id === action.payload.questionId
        );
        if (question) {
          question.votes = action.payload.votes;
        }
      })

      // Vote Answer
      .addCase(voteAnswer.fulfilled, (state, action) => {
        const question = state.questions.find(
          (q) => q._id === action.payload.questionId
        );
        if (question) {
          const answer = question.answers.find(
            (a) => a._id === action.payload.answerId
          );
          if (answer) {
            answer.votes = action.payload.votes;
          }
        }
      })

      // Delete Question
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(
          (q) => q._id !== action.payload
        );
        state.pagination.total -= 1;
      })

      // Delete Answer
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        const question = state.questions.find(
          (q) => q._id === action.payload.questionId
        );
        if (question) {
          question.answers = question.answers.filter(
            (a) => a._id !== action.payload.answerId
          );
        }
      });
  },
});

export const {
  setFilters,
  setPagination,
  clearError,
  clearQuestions,
  addQuestionOptimistic,
  addAnswerOptimistic,
} = questionsSlice.actions;

export default questionsSlice.reducer;
