import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './slices/apiSlice';

import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';

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


import settingsReducer from '@/redux/store/slices/settings/settingsSlice';


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


		user: userReducer,
		order: orderReducer,
		voucher: voucherReducer,

		statcard: statcardReducer,
		questions: questionsReducer,
	
		notification: notificationReducer,

		blog: blogReducer,
		combo: comboReducer,
		shipping: shippingReducer,
		dashboard: dashboardReducer,
settings: settingsReducer,
	},

	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});
