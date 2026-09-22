import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	bestSelling: [],
	loading: false
};

const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,

	reducers: {
		setDashboaed(state, action) {
			state.dashboard = action.payload;
		},

	},
});

export const { setProducts} =
	dashboardSlice.actions;

export default dashboardSlice.reducer;
