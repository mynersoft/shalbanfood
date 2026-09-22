import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {
    general: {
      shopName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      description: '',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      dateFormat: 'DD/MM/YYYY',
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      newOrders: true,
      lowStock: true,
      customerMessages: true,
      reviews: true,
    },
    shipping: {
      domestic: 60,
      international: 500,
      freeThreshold: 1500,
      allowReturns: true,
      returnDays: 7,
      autoRestock: false,
    },
    payments: {
      methods: ['cash_on_delivery', 'bKash', 'nagad', 'bank'],
      bKashNumber: '',
      nagadNumber: '',
      bankAccount: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: '',
      },
    },
    security: {
      enable2FA: false,
      sessionTimeout: 30,
      loginAlerts: true,
    },
    api: {
      enabled: false,
      apiKey: '',
      webhooks: [],
    },
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action) {
      state.settings = action.payload;
    },
    updateSettings(state, action) {
      const { section, data } = action.payload;
      state.settings[section] = { ...state.settings[section], ...data };
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    resetSettings(state) {
      state.settings = initialState.settings;
    },
  },
});

export const {
  setSettings,
  updateSettings,
  setLoading,
  setError,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;