<<<<<<< HEAD
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import investReducer from './investSlice';
import dueReducer from './duesSlice';
import saleReducer from './saleSlice';
import serviceReducer from './serviceSlice';
import categoryReducer from './categorySlice';
import brandReducer from './brandsSlice';
import saleprofitReducer from './saleprofitSlice';
import billReducer from './billSlice';
import cartReducer from './cartSlice';
=======
import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import investReducer from "./investSlice";
import dueReducer from "./duesSlice";
import saleReducer from "./saleSlice";
import serviceReducer from "./serviceSlice";
import categoryReducer from "./categorySlice";
import brandReducer from "./brandsSlice";
import saleprofitReducer from "./saleprofitSlice";
import transactionReducer from "./transactionSlice";
import aybayReducer from "./aybaySlice";

import billReducer from "./billSlice";
>>>>>>> 42c33ebc52b9b953d0f3359e8dac5d8222c25a97

export const store = configureStore({
	reducer: {
		products: productReducer,
		categories: categoryReducer,
		brands: brandReducer,
		service: serviceReducer,
		dues: dueReducer,
		sales: saleReducer,
<<<<<<< HEAD
		bills: billReducer,
		saleprofit: saleprofitReducer,
		invest: investReducer,
		cart: cartReducer,
=======
bills: billReducer,
aybay: aybayReducer,
		saleprofit: saleprofitReducer,
invest: investReducer,
transactions: transactionReducer
>>>>>>> 42c33ebc52b9b953d0f3359e8dac5d8222c25a97
	},
});
