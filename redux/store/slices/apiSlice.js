import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	endpoints: (builder) => ({
		getProducts: builder.query({
			query: () => "/products",
		}),
		addProduct: builder.mutation({
			query: (product) => ({
				url: "/products",
				method: "POST",
				body: product,
			}),
		}),
		updateProduct: builder.mutation({
			query: ({ id, ...data }) => ({
				url: "/products",
				method: "PUT",
				body: { id, ...data },
			}),
		}),
		deleteProduct: builder.mutation({
			query: (id) => ({
				url: "/products",
				method: "DELETE",
				body: { id },
			}),
		}),
	}),
});

export const {
	useGetProductsQuery,
	useAddProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
} = apiSlice;
