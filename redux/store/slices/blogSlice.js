import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	list: [],
	selected: null,
	loading: false,
	error: null,
};

const blogSlice = createSlice({
	name: 'blogs',

	initialState,

	reducers: {
		setBlogs: (state, action) => {
			state.list = action.payload;
		},

		setSelectedBlog: (state, action) => {
			state.selected = action.payload;
		},

		addBlog: (state, action) => {
			state.list.unshift(action.payload);
		},

		updateBlog: (state, action) => {
			const index = state.list.findIndex(
				(blog) => blog._id === action.payload._id
			);

			if (index !== -1) {
				state.list[index] = action.payload;
			}
		},

		deleteBlog: (state, action) => {
			state.list = state.list.filter(
				(blog) => blog._id !== action.payload
			);
		},

		setBlogLoading: (state, action) => {
			state.loading = action.payload;
		},

		setBlogError: (state, action) => {
			state.error = action.payload;
		},

		clearSelectedBlog: (state) => {
			state.selected = null;
		},
	},
});

export const {
	setBlogs,
	setSelectedBlog,
	addBlog,
	updateBlog,
	deleteBlog,
	setBlogLoading,
	setBlogError,
	clearSelectedBlog,
} = blogSlice.actions;

export default blogSlice.reducer;
