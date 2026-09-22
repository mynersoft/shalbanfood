"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useSelector } from "react-redux";

// ✅ Simple Modal Component
function Modal({ isOpen, onClose, children }) {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
				{children}
				<div className="mt-4 flex justify-end">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function ProductTable() {
	const { items } = useSelector((s) => s.products);
	const [search, setSearch] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		price: "",
		stock: "",
		image: "",
		brand: "",
	});
	const [imagePreview, setImagePreview] = useState("");

	// ✅ Upload image to Cloudinary
	const handleImageUpload = async (file) => {
		const formData = new FormData();
		formData.append("file", file);

		const res = await fetch("/api/upload", {
			method: "POST",
			body: formData,
		});

		const data = await res.json();
		return data.url;
	};

	// ✅ Handle Add/Edit Submit
	const handleSubmit = async (e) => {
		e.preventDefault();
		const { name, price, stock } = formData;

		if (!name || !price || !stock)
			return alert("⚠️ All fields are required!");

		let imageUrl = formData.image;

		// Upload new image if selected (file object)
		if (imagePreview && imagePreview.startsWith("blob:")) {
			const fileInput = document.querySelector("#productImage");
			if (fileInput.files[0]) {
				imageUrl = await handleImageUpload(fileInput.files[0]);
			}
		}

		const payload = {
			name,
			price: Number(price),
			stock: Number(stock),
			image: imageUrl,
		};

		if (editingProduct) {
			await fetch(`/api/products/${editingProduct._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			alert("✅ Product updated!");
		} else {
			await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			alert("✅ Product added!");
		}

		setIsModalOpen(false);
		setEditingProduct(null);
		setFormData({ name: "", price: "", stock: "", image: "" });
		setImagePreview("");
		fetchProducts();
	};

	// ✅ Delete Product
	const handleDelete = async (id) => {
		if (!confirm("Are you sure?")) return;
		await fetch(`/api/products/${id}`, { method: "DELETE" });
		alert("🗑️ Product deleted!");
		fetchProducts();
	};

	// ✅ Edit Product
	const handleEdit = (product) => {
		setEditingProduct(product);
		setFormData({
			name: product.name,
			price: product.price,
			stock: product.stock,
			image: product.image || "",
		});
		setImagePreview(product.image || "");
		setIsModalOpen(true);
	};

	// ✅ Image Preview
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const previewURL = URL.createObjectURL(file);
			setImagePreview(previewURL);
			setFormData({ ...formData, image: previewURL });
		}
	};

	const filtered = items?.filter((p) =>
		p.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="overflow-x-auto rounded-lg shadow mt-4">
			<div className="flex justify-between mb-3">
				<input
					type="text"
					placeholder="Search product..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="border px-3 py-2 rounded-lg w-64"
				/>
				<Button
					onClick={() => {
						setEditingProduct(null);
						setFormData({
							name: "",
							price: "",
							stock: "",
							image: "",
						});
						setImagePreview("");
						setIsModalOpen(true);
					}}>
					<Plus className="w-4 h-4 mr-1" /> Add Product
				</Button>
			</div>

			<table className="min-w-full bg-white border border-gray-200">
				<thead className="bg-gray-100 text-gray-700">
					<tr>
						<th className="py-3 px-4 border-b text-left">#</th>
						<th className="py-3 px-4 border-b text-left">Image</th>
						<th className="py-3 px-4 border-b text-left">Name</th>
						<th className="py-3 px-4 border-b text-left">Price</th>
						<th className="py-3 px-4 border-b text-left">Stock</th>
						<th className="py-3 px-4 border-b text-left">Brand</th>
						<th className="py-3 px-4 border-b text-center">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{filtered.map((p, i) => (
						<tr key={p._id} className="hover:bg-gray-50 transition">
							<td className="py-3 px-4 border-b">{i + 1}</td>
							<td className="py-3 px-4 border-b">
								<img
									src={p.image || "/no-image.png"}
									className="w-12 h-12 object-cover rounded"
								/>
							</td>
							<td className="py-3 px-4 border-b font-medium">
								{p.name}
							</td>
							<td className="py-3 px-4 border-b">{p.price}</td>
							<td className="py-3 px-4 border-b">{p.stock}</td>
							<td className="py-3 px-4 border-b">{p.brand}</td>
							<td className="py-3 px-4 border-b text-center space-x-2">
								<Button
									variant="outline"
									onClick={() => handleEdit(p)}>
									<Pencil className="w-4 h-4 mr-1" /> Edit
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDelete(p._id)}>
									<Trash2 className="w-4 h-4 mr-1" /> Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Modal */}
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<h2 className="text-xl font-semibold mb-4">
					{editingProduct ? "Edit Product" : "Add Product"}
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						type="text"
						placeholder="Product Name"
						value={formData.name}
						onChange={(e) =>
							setFormData({ ...formData, name: e.target.value })
						}
						className="w-full border px-3 py-2 rounded-lg"
					/>
					<input
						type="number"
						placeholder="Price"
						value={formData.price}
						onChange={(e) =>
							setFormData({ ...formData, price: e.target.value })
						}
						className="w-full border px-3 py-2 rounded-lg"
					/>
					<input
						type="number"
						placeholder="Stock"
						value={formData.stock}
						onChange={(e) =>
							setFormData({ ...formData, stock: e.target.value })
						}
						className="w-full border px-3 py-2 rounded-lg"
					/>
					<input
						type="string"
						placeholder="Brand"
						value={formData.brand}
						onChange={(e) =>
							setFormData({ ...formData, brand: e.target.value })
						}
						className="w-full border px-3 py-2 rounded-lg"
					/>
					<div>
						<label>Product Image</label>
						<input
							id="productImage"
							type="file"
							accept="image/*"
							onChange={handleImageChange}
						/>
						{imagePreview && (
							<img
								src={imagePreview}
								alt="preview"
								className="w-16 h-16 mt-2 rounded border"
							/>
						)}
					</div>
					<Button type="submit" variant="default">
						{editingProduct ? "Update" : "Add"}
					</Button>
				</form>
			</Modal>
		</div>
	);
}
