import { createSlice } from '@reduxjs/toolkit';

const extractOrders = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.orders)) return payload.orders;
	return [];
};

const orderSlice = createSlice({
	name: 'order',

	initialState: {
		loading: false,
		success: false,
		error: null,
		orders: [],
		ordersAdmin: [],
		order: null,
	},

	reducers: {
		resetOrder(state) {
			state.loading = false;
			state.success = false;
			state.error = null;
		},

		setOrders(state, action) {
			state.orders = extractOrders(action.payload);
		},

		setAdminOrders(state, action) {
			state.ordersAdmin = extractOrders(action.payload);
		},

		setSingleOrder(state, action) {
			state.order = action.payload?.order || action.payload || null;
		},

		addOrder(state, action) {
			const order = action.payload?.order || action.payload;
			if (!order?._id) return;

			state.orders = [
				order,
				...state.orders.filter((item) => item._id !== order._id),
			];
		},

		removeOrder(state, action) {
			const id = action.payload;

			state.orders = state.orders.filter((item) => item._id !== id);
			state.ordersAdmin = state.ordersAdmin.filter(
				(item) => item._id !== id
			);

			if (state.order?._id === id) {
				state.order = null;
			}
		},
	},
});

export const {
	resetOrder,
	setOrders,
	setAdminOrders,
	setSingleOrder,
	addOrder,
	removeOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
