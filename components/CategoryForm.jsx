'use client';

import React, { useEffect, useState } from 'react';

export default function CategoryForm({
	onSubmit,
	editingCategory,
	onCancel,
	loading = false,
}) {
	const [name, setName] = useState('');
	const [subCategories, setSubCategories] = useState('');

	useEffect(() => {
		if (editingCategory) {
			setName(editingCategory.name || '');

			setSubCategories(
				Array.isArray(editingCategory.subCategories)
					? editingCategory.subCategories.join(', ')
					: ''
			);
		} else {
			setName('');
			setSubCategories('');
		}
	}, [editingCategory]);

	const handleSubmit = (event) => {
		event.preventDefault();

		const cleanName = name.trim();

		if (!cleanName) {
			return;
		}

		const cleanSubCategories = subCategories
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);

		onSubmit({
			name: cleanName,
			subCategories: [...new Set(cleanSubCategories)],
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* NAME */}
			<div>
				<label
					htmlFor="category-name"
					className="mb-2 block text-sm font-medium text-gray-300">
					Category Name
				</label>

				<input
					id="category-name"
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Enter category name"
					required
					disabled={loading}
					className="w-full rounded-lg border border-gray-700 bg-[#0e0e11] px-3 py-2.5 text-gray-200 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
				/>
			</div>

			{/* SUBCATEGORIES */}
			<div>
				<label
					htmlFor="subcategories"
					className="mb-2 block text-sm font-medium text-gray-300">
					Subcategories
				</label>

				<input
					id="subcategories"
					type="text"
					value={subCategories}
					onChange={(event) => setSubCategories(event.target.value)}
					placeholder="e.g. সকেট, সুইচ, বাতি"
					disabled={loading}
					className="w-full rounded-lg border border-gray-700 bg-[#0e0e11] px-3 py-2.5 text-gray-200 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
				/>

				<p className="mt-1.5 text-xs text-gray-500">
					Separate multiple subcategories with commas.
				</p>
			</div>

			{/* BUTTONS */}
			<div className="flex gap-3 pt-2">
				<button
					type="submit"
					disabled={loading || !name.trim()}
					className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
					{loading
						? 'Saving...'
						: editingCategory
							? 'Update Category'
							: 'Add Category'}
				</button>

				<button
					type="button"
					onClick={onCancel}
					disabled={loading}
					className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50">
					Cancel
				</button>
			</div>
		</form>
	);
}
