import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import axios from 'axios';

// ============================================
// FETCH SETTINGS
// ============================================

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/settings');

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to load settings'
      );
    }
  }
);

// ============================================
// UPDATE SETTINGS
// ============================================

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        '/api/settings',
        settings
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update settings'
      );
    }
  }
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  data: null,

  loading: false,
  saving: false,

  error: null,
  saveError: null,

  initialized: false,
};

// ============================================
// SLICE
// ============================================

const settingsSlice = createSlice({
  name: 'settings',

  initialState,

  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
      state.saveError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchSettings.fulfilled,
        (state, action) => {
          state.loading = false;
          state.data = action.payload;
          state.initialized = true;
        }
      )

      .addCase(
        fetchSettings.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.initialized = true;
        }
      )

      // UPDATE
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(
        updateSettings.fulfilled,
        (state, action) => {
          state.saving = false;
          state.data = action.payload;
        }
      )

      .addCase(
        updateSettings.rejected,
        (state, action) => {
          state.saving = false;
          state.saveError = action.payload;
        }
      );
  },
});

export const {
  clearSettingsError,
} = settingsSlice.actions;

export default settingsSlice.reducer;