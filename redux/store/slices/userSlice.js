// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  users: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    getAllUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setUser, clearUser, getAllUsers } = userSlice.actions;
export default userSlice.reducer;
