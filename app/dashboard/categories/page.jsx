'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '@/redux/productSlice';
import { useRouter, useSearchParams } from 'next/navigation';

import ProductFormModal from '@/components/dashboard/ProductFormModal';
import CategoryForm from '@/components/dashboard/CategoryForm';
import Modal from '@/components/Modal';
import { addCategory, deleteCategory } from '@/redux/store/slices/categorySlice';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategory';

export default function CategoryPage() {
	const { isLoading, isFetching } = useCategories();
	const {category} = useSelector((s) => s.category);

	console.log(category);
	

	// Delete product
	const handleDelete = async (id) => {
		if (!confirm('Delete product?')) return;
		await dispatch(deleteCategory(id)).unwrap();
		// dispatch(fetchProducts());
	};

	

	return (
		<div className="p-4 min-h-screen bg-gray-950 text-gray-300">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
				<h1 className="text-2xl font-semibold">Products</h1>

				<button
					onClick={() => setShowCatModal(true)}
					className="bg-green-600 px-4 py-2 rounded">
					+ Add Category
				</button>
			</div>

			{/* TABLE (DESKTOP) */}
			<div className="hidden md:block overflow-x-auto bg-gray-900 rounded-lg">
				<table className="w-full text-sm">
					<thead className="bg-gray-800">
						<tr>
							<th className="p-3 text-left">Image</th>
							<th className="p-3 text-left">Name</th>
							<th className="p-3 text-left">Category</th>
							<th className="p-3 text-left">Brand</th>
							<th className="p-3 text-left">Stock</th>
							<th className="p-3 text-left">Regular Price</th>
							<th className="p-3 text-left">Sell Price</th>
							<th className="p-3 text-center">Actions</th>
						</tr>
					</thead>

					<tbody>
						{filteredItems.length > 0 ? (
							filteredItems.map((p) => (
								<tr
									key={p._id}
									className="border-b border-gray-800 hover:bg-gray-800/40">
									<td className="p-3">
										{p.image && (
											<Image
												height={50}
												width={50}
												src={p.featureImg}
												alt={p.name || ''}
												className="w-14 h-14 object-cover rounded"
											/>
										)}
									</td>
									<td className="p-3">{p.name}</td>
									<td className="p-3">{p.category}</td>
									<td className="p-3">{p.brand}</td>
									<td className="p-3">{p.stock}</td>
									<td className="p-3">{p.regularPrice}</td>
									<td className="p-3">{p.sellPrice}</td>

									<td className="p-3 text-center flex gap-2 justify-center">
										<button
											onClick={() => {
												setEditingProduct(p);
												setShowModal(true);
											}}
											className="bg-blue-600 px-3 py-1 rounded">
											Edit
										</button>
										<button
											onClick={() => handleDelete(p._id)}
											className="bg-red-600 px-3 py-1 rounded">
											Delete
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={8}
									className="p-6 text-center text-gray-500">
									No products found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* MOBILE VIEW */}
			<div className="md:hidden space-y-4">
				{filteredItems.length ? (
					filteredItems.map((p) => (
						<div
							key={p._id}
							className="bg-gray-900 p-4 rounded-lg border border-gray-800">
							<div className="flex items-center gap-3">
								{p.image && (
									<img
										src={p.image}
										alt={p.name || ''}
										className="w-10 h-20 object-cover rounded"
									/>
								)}
								<div>
									<h2 className="font-semibold">{p.name}</h2>
									<p className="text-gray-400 text-sm">
										{p.category} • {p.brand}
									</p>
								</div>
							</div>

							<div className="mt-3 grid grid-cols-2 text-sm">
								<p>Regular: {p.regularPrice}</p>
								<p>Stock: {p.stock}</p>
								<p>Sell: {p.sellPrice}</p>
							</div>

							<div className="flex gap-2 mt-3">
								<button
									onClick={() => {
										setEditingProduct(p);
										setShowModal(true);
									}}
									className="bg-blue-600 px-3 py-1 rounded w-full">
									Edit
								</button>
								<button
									onClick={() => handleDelete(p._id)}
									className="bg-red-600 px-3 py-1 rounded w-full">
									Delete
								</button>
							</div>
						</div>
					))
				) : (
					<p className="text-center text-gray-500">
						No products found
					</p>
				)}
			</div>

			{/* PAGINATION */}
			<div className="flex justify-center gap-2 mt-4">
				{Array.from({ length: totalPages }).map((_, i) => (
					<button
						key={i + 1}
						onClick={() => setPageLocal(i + 1)}
						className={`px-3 py-1 rounded ${
							pageLocal === i + 1
								? 'bg-green-600 text-white'
								: 'bg-gray-800 text-gray-400'
						}`}>
						{i + 1}
					</button>
				))}
			</div>

			{/* PRODUCT MODAL */}
			{showModal && (
				<ProductFormModal
					open={showModal}
					editingProduct={editingProduct}
					onClose={() => {
						setShowModal(false);
						setEditingProduct(null);
						dispatch(fetchProducts({ page: pageLocal, limit }));
					}}
				/>
			)}

			{/* CATEGORY MODAL */}
			<Modal show={showCatModal} onClose={handleCancel}>
				<h3 className="text-lg mb-4 font-semibold text-gray-100">
					Add Category
				</h3>
				<CategoryForm
					onCancel={handleCancel}
					onSubmit={handleCatSubmit}
				/>
			</Modal>
		</div>
	);
}
