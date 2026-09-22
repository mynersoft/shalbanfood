import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	products: [],
	loading: true
};

const productSlice = createSlice({
	name: 'product',
	initialState,

	reducers: {
		setProducts(state, action) {
			state.products = action.payload;
		},

		addProduct(state, action) {
			state.products.push(action.payload);
		},

		updateProduct(state, action) {
			const index = state.products.findIndex(
				(p) => p._id === action.payload._id
			);

			if (index !== -1) {
				state.products[index] = action.payload;
			}
		},

		removeProduct(state, action) {
			state.products = state.products.filter(
				(product) => product._id !== action.payload
			);
		},
	},
});

export const { setProducts, addProduct, updateProduct, removeProduct } =
	productSlice.actions;

export default productSlice.reducer;
