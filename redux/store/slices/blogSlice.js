import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	posts: [],
	loading: false,
};

const blogSlice = createSlice({
	name: "blog",
	initialState,
	reducers: {
		setBlogs: (state, action) => {
			state.posts = action.payload;
			state.loading = false;
		},
		setBlogLoading: (state, action) => {
			state.loading = action.payload;
		},
	},
});

export const { setBlogs, setBlogLoading } = blogSlice.actions;
export default blogSlice.reducer;
