'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ShopFilters from '@/components/shop/ShopFillters';
import ShopList from '@/components/shop/ShopLists';
import { useProducts } from '@/hooks/useDashboard';

export default function ShopPage() {
	const { isLoading, isFetching } = useProducts();

	const products = useSelector((state) => state.product.products);

	const [filtered, setFiltered] = useState([]);

	useEffect(() => {
		setFiltered(products);
	}, [products]);

	const handleFilter = ({ search, sort }) => {
		let data = [...products];

		// Search Filter
		if (search) {
			data = data.filter((p) =>
				p.name.toLowerCase().includes(search.toLowerCase())
			);
		}

		// Sort
		if (sort === 'low') data.sort((a, b) => a.sellPrice - b.sellPrice);
		if (sort === 'high') data.sort((a, b) => b.sellPrice - a.sellPrice);

		setFiltered(data);
	};

	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold text-gray-700 mb-4">Shop</h1>

			<ShopFilters onFilter={handleFilter} />

			{isLoading ? (
				<p className="text-gray-500">Loading...</p>
			) : (
				<ShopList products={filtered} />
			)}
		</div>
	);
}
