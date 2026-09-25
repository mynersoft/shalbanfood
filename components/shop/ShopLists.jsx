'use client';

import { addToCart } from '@/redux/store/slices/cartSlice';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import ProductCard from '../products/ProductCard';

export default function ShopList({ products }) {
	const dispatch = useDispatch();

	const handleAddToCart = (product) => {
		dispatch(addToCart({ product }));
		toast.success('Added to cart!');
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{products.map((product) => (
				<ProductCard key={product._id} product={product} />
			))}
		</div>
	);
}
