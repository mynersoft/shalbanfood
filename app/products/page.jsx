"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "@/redux/productSlice";
import { useRouter, useSearchParams } from "next/navigation";

import ProductFormModal from "@/components/ProductFormModal";
import CategoryForm from "@/components/CategoryForm";
import Modal from "@/components/Modal";
import { addCategory } from "@/redux/categorySlice";

export default function ProductsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { items, total, page: reduxPage, limit } = useSelector((s) => s.products);

    const [pageLocal, setPageLocal] = useState(reduxPage || 1);
    const [showModal, setShowModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Initialize search from URL query param `search` (or empty if none)
    const initialSearch = searchParams?.get("search") || "";
    const [search, setSearch] = useState(initialSearch);
    const [filteredItems, setFilteredItems] = useState([]);

    // Fetch products when page changes
    useEffect(() => {
        dispatch(fetchProducts({ page: pageLocal, limit }));
    }, [dispatch, pageLocal, limit]);

    // Delete product
    const handleDelete = async (id) => {
        if (!confirm("Delete product?")) return;
        await dispatch(deleteProduct(id)).unwrap();
        dispatch(fetchProducts({ page: pageLocal, limit }));
    };

    // Update filtered items when `items` or `search` changes
    useEffect(() => {
        if (!Array.isArray(items)) {
            setFilteredItems([]);
            return;
        }

        const result = items.filter((p) => {
            if (!p.name) return false;
            if (!search) return true;
            return p.name.toLowerCase().includes(search.toLowerCase());
        });

        setFilteredItems(result);
    }, [items, search]);

    // Update URL query dynamically when search changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (search) {
            params.set("search", search);
        } else {
            params.delete("search");
        }
        const queryString = params.toString();
        router.replace(`/products${queryString ? `?${queryString}` : ""}`);
    }, [search, router]);

    const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

    const handleCancel = () => setShowCatModal(false);

    const handleCatSubmit = (payload) => {
        dispatch(addCategory(payload));
        setShowCatModal(false);
        alert("Category added successfully!");
    };

    return (
		<div className="p-4 min-h-screen bg-gray-950 text-gray-300">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
				<h1 className="text-2xl font-semibold">Products</h1>

				{/* SEARCH */}
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name..."
					className="px-4 py-2 rounded bg-gray-800 w-full md:w-64 border border-gray-700 text-gray-300"
				/>

				<div className="flex gap-2">
					<button
						onClick={() => {
							setEditingProduct(null);
							setShowModal(true);
						}}
						className="bg-green-600 px-4 py-2 rounded">
						+ Add Product
					</button>

					<button
						onClick={() => setShowCatModal(true)}
						className="bg-green-600 px-4 py-2 rounded">
						+ Add Category
					</button>

					<button
						onClick={() => router.push("/products/list")}
						className="px-4 py-2 bg-blue-600 text-white rounded">
						List
					</button>
				</div>
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
											<img
												src={p.image}
												alt={p.name || ""}
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
										alt={p.name || ""}
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
								? "bg-green-600 text-white"
								: "bg-gray-800 text-gray-400"
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