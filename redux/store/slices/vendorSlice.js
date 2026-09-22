import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vendor: {
    id: '',
    name: '',
    email: '',
    shopName: '',
    avatar: '',
    joinDate: '',
    rating: 0,
    totalSales: 0,
    phone: '',
    address: '',
    status: 'active',
    verificationStatus: 'verified',
    shopSince: '',
    description: '',
    categories: [],
    socialLinks: {},
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    uiState: {
      sidebarCollapsed: false,
      currentPage: 'dashboard',
      theme: 'light',
    },
  },
  stats: {
    totalRevenue: 0,
    revenueChange: 0,
    totalProducts: 0,
    productsChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    activeCustomers: 0,
    customersChange: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    satisfactionRate: 0,
  },
  recentActivities: [],
  isLoading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setVendor(state, action) {
      state.vendor = { ...state.vendor, ...action.payload };
    },
    setVendorStats(state, action) {
      state.stats = action.payload;
    },
    setRecentActivities(state, action) {
      state.recentActivities = action.payload;
    },
    updateVendor(state, action) {
      state.vendor = { ...state.vendor, ...action.payload };
    },
    toggleSidebar(state) {
      state.vendor.uiState.sidebarCollapsed = !state.vendor.uiState.sidebarCollapsed;
    },
    setCurrentPage(state, action) {
      state.vendor.uiState.currentPage = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    logoutVendor(state) {
      state.vendor = initialState.vendor;
      state.stats = initialState.stats;
      state.recentActivities = [];
    },
    addActivity(state, action) {
      state.recentActivities.unshift(action.payload);
      if (state.recentActivities.length > 20) {
        state.recentActivities.pop();
      }
    },
  },
});

export const {
  setVendor,
  setVendorStats,
  setRecentActivities,
  updateVendor,
  toggleSidebar,
  setCurrentPage,
  setLoading,
  setError,
  logoutVendor,
  addActivity,
} = vendorSlice.actions;

export default vendorSlice.reducer;