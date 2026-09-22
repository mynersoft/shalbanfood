import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    markAsRead(state, action) {
      const id = action.payload;
      const index = state.notifications.findIndex(n => n._id === id);
      if (index !== -1) {
        state.notifications[index].isRead = true;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => (n.isRead = true));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;