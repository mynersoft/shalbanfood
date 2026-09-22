import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {
	setProducts,
	addProduct,
	removeProduct,
	updateProduct,
} from '@/redux/store/slices/productSlice';
import toast from 'react-hot-toast';

// Fetch products hook
export function useProducts() {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['products'],
		queryFn: async () => {
			const res = await axios.get('/api/products');
			dispatch(setProducts(res.data)); // store in Redux
			return res.data;
		},
		onError: (error) => {
			toast.error(`Failed to fetch products: ${error.message}`);
		},
		onSuccess: () => {
			toast.success('Products fetched successfully');
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

// Add product hook
export function useAddProduct() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (productData) => {
			const res = await axios.post('/api/products', productData);
			return res.data.product;
		},

		onMutate: () => {
			toast.loading('Adding product...', { id: 'add-product' });
		},

		onSuccess: (newProduct) => {
			dispatch(addProduct(newProduct));
			queryClient.invalidateQueries({ queryKey: ['products'] });

			toast.success('Product added successfully!', {
				id: 'add-product',
			});
		},

		onError: (error) => {
			let message = 'Failed to add product';

			if (axios.isAxiosError(error)) {
				message =
					error.response?.data?.error ||
					error.response?.data?.message ||
					error.message;
			} else if (error instanceof Error) {
				message = error.message;
			}

			toast.error(message, { id: 'add-product' });
		},
	});
}

// delete products
export const useDeleteProduct = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (id) => {
			const res = await axios.delete(`/api/products/id/${id}`);
			return res.data;
		},

		onMutate: (id) => {
			toast.loading('Deleting product...', { id: 'delete-product' });
		},
		onSuccess: (_, id) => {
			dispatch(removeProduct(id));
			queryClient.invalidateQueries(['products']);
			toast.success('Product deleted successfully!', {
				id: 'delete-product',
			});
		},
		onError: (error) => {
			toast.error('Failed to delete product: ' + error.message, {
				id: 'delete-product',
			});
		},
	});
};

// update
export function useUpdateProduct() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async ({ id, data }) => {
			const res = await axios.put(`/api/products/id/${id}`, data);
			return res.data.product;
		},

		onMutate: () => {
			toast.loading('Updating product...', { id: 'update-product' });
		},

		onSuccess: (data) => {
			dispatch(updateProduct(data));
			queryClient.invalidateQueries({ queryKey: ['products'] });

			toast.success('Product updated successfully!', {
				id: 'update-product',
			});
		},

		onError: (error) => {
			let message = 'Failed to update product';

			if (axios.isAxiosError(error)) {
				message =
					error.response?.data?.message ||
					error.response?.data?.error ||
					error.message;
			} else if (error instanceof Error) {
				message = error.message;
			}

			toast.error(message, { id: 'update-product' });
		},
	});
}
