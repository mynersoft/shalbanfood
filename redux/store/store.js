import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './slices/apiSlice';

import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import voucherReducer from './slices/voucherSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import blogReducer from './slices/blogSlice';
import authReducer from './slices/authSlice';
import statcardReducer from './slices/statCardSlice';
import authRecoveryReducer from './slices/authRecoverySlice';
import notificationReducer from './slices/notificationSlice';
import questionsReducer from './slices/questionsSlice';
import comboReducer from './slices/comboSlice';
import vendorReducer from './slices/vendorSlice';
import uiReducer from './slices/uiSlice';
import categoryReducer from './slices/categorySlice';
import brandReducer from './slices/brandsSlice';
import shippingReducer from './slices/shippingSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
	reducer: {
		[apiSlice.reducerPath]: apiSlice.reducer,

		authRecovery: authRecoveryReducer,
		auth: authReducer,
		ui: uiReducer,

		product: productReducer,
		brand: brandReducer,
		category: categoryReducer,

		cart: cartReducer,
		wishlist: wishlistReducer,

		user: userReducer,
		order: orderReducer,
		voucher: voucherReducer,

		statcard: statcardReducer,
		questions: questionsReducer,
		vendor: vendorReducer,
		notification: notificationReducer,

		blog: blogReducer,
		combo: comboReducer,
		shipping: shippingReducer,
		dashboard: dashboardReducer,
	},

	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});
