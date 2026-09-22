import { createSlice } from '@reduxjs/toolkit';

/* ================= Modal Types ================= */
export const UI_MODAL_TYPE = {
  NONE: 'none',
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
  DELETE: 'delete',
};

/* ================= Initial State ================= */
const initialState = {
  modalType: UI_MODAL_TYPE.NONE,
  modalProps: null,

  // 🔹 sidebar state (MATCH Layout)
  sidebarOpen: true,

  isLoading: false,
  notifications: [],
};

/* ================= Slice ================= */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /* ---------- Modal ---------- */
    setModal: (state, action) => {
      state.modalType = action.payload.type;
      state.modalProps = action.payload.props || null;
    },
    closeModal: (state) => {
      state.modalType = UI_MODAL_TYPE.NONE;
      state.modalProps = null;
    },

    /* ---------- Sidebar ---------- */
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    /* ---------- UI ---------- */
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    /* ---------- Notifications ---------- */
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

/* ================= Exports ================= */
export const {
  setModal,
  closeModal,
  toggleSidebar,
  setSidebar,
  setIsLoading,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
