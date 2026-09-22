'use client';

import React, { useEffect, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
	fetchCategories,
	addCategory,
	updateCategory,
	deleteCategory,
} from '@/redux/categorySlice';

import CategoryForm from '@/components/CategoryForm';
import AddCategoryButton from '@/components/AddCategoryButton';

import toast from 'react-hot-toast';

export default function CategoriesPage() {
	const dispatch = useDispatch();

	const {
		list = [],
		loading = false,
		saving = false,
	} = useSelector((state) => state.categories || {});

	const categories = Array.isArray(list) ? list : [];

	const [editingCategory, setEditingCategory] = useState(null);

	const [showModal, setShowModal] = useState(false);

	const [deletingId, setDeletingId] = useState(null);

	// ========================================
	// FETCH ON PAGE LOAD
	// ========================================
	useEffect(() => {
		dispatch(fetchCategories());
	}, [dispatch]);

	// ========================================
	// ERROR MESSAGE
	// ========================================
	const getErrorMessage = (error, fallback) => {
		if (!error) return fallback;

		if (typeof error === 'string') {
			return error;
		}

		return error?.message || error?.error || error?.payload || fallback;
	};

	// ========================================
	// SUBMIT
	// ========================================
	const handleSubmit = async (payload) => {
		try {
			if (editingCategory?._id) {
				await dispatch(
					updateCategory({
						id: editingCategory._id,
						...payload,
					})
				).unwrap();

				toast.success('Category updated successfully!');
			} else {
				await dispatch(addCategory(payload)).unwrap();

				toast.success('Category added successfully!');
			}

			setEditingCategory(null);
			setShowModal(false);
		} catch (error) {
			console.error('Category save error:', error);

			toast.error(getErrorMessage(error, 'Failed to save category!'));
		}
	};

	// ========================================
	// DELETE
	// ========================================
	const handleDelete = async (id) => {
		if (!id || deletingId) {
			return;
		}

		const confirmed = window.confirm(
			'Are you sure you want to delete this category?'
		);

		if (!confirmed) {
			return;
		}

		try {
			setDeletingId(id);

			await dispatch(deleteCategory(id)).unwrap();

			toast.success('Category deleted successfully!');
		} catch (error) {
			console.error('Category delete error:', error);

			toast.error(getErrorMessage(error, 'Failed to delete category!'));
		} finally {
			setDeletingId(null);
		}
	};

	// ========================================
	// EDIT
	// ========================================
	const handleEdit = (category) => {
		setEditingCategory({
			...category,
			subCategories: Array.isArray(category.subCategories)
				? category.subCategories
				: [],
		});

		setShowModal(true);
	};

	// ========================================
	// ADD
	// ========================================
	const handleAddCategory = () => {
		setEditingCategory(null);
		setShowModal(true);
	};

	// ========================================
	// CANCEL
	// ========================================
	const handleCancel = () => {
		if (saving) return;

		setEditingCategory(null);
		setShowModal(false);
	};

	return (
		<div className="min-h-screen bg-[#0c0c0f] p-4 text-gray-200 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* HEADER */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-white sm:text-3xl">
							📦 Manage Categories
						</h1>

						<p className="mt-1 text-sm text-gray-500">
							Create, update and manage your product categories.
						</p>
					</div>

					<AddCategoryButton onClick={handleAddCategory} />
				</div>

				{/* CATEGORY CARD */}
				<div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#131318] shadow-xl">
					{/* CARD HEADER */}
					<div className="border-b border-gray-800 p-4 sm:p-6">
						<h2 className="text-xl font-semibold text-white">
							All Categories
						</h2>

						<p className="mt-1 text-sm text-gray-500">
							{categories.length}{' '}
							{categories.length === 1
								? 'category'
								: 'categories'}
						</p>
					</div>

					{/* LOADING */}
					{loading ? (
						<div className="flex min-h-[250px] items-center justify-center">
							<div className="flex items-center gap-3 text-gray-400">
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-white" />

								<span>Loading categories...</span>
							</div>
						</div>
					) : categories.length === 0 ? (
						/* EMPTY */
						<div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
							<div className="mb-3 text-5xl">📦</div>

							<h3 className="text-lg font-semibold text-gray-300">
								No categories found
							</h3>

							<p className="mt-1 max-w-sm text-sm text-gray-500">
								Create your first category to get started.
							</p>

							<button
								type="button"
								onClick={handleAddCategory}
								className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
								+ Add Category
							</button>
						</div>
					) : (
						/* TABLE */
						<div className="overflow-x-auto">
							<table className="w-full min-w-[650px] border-collapse">
								<thead>
									<tr className="border-b border-gray-800 bg-[#1a1a20]">
										<th className="p-4 text-left text-sm font-semibold text-gray-300">
											Name
										</th>

										<th className="p-4 text-left text-sm font-semibold text-gray-300">
											Subcategories
										</th>

										<th className="p-4 text-left text-sm font-semibold text-gray-300">
											Actions
										</th>
									</tr>
								</thead>

								<tbody>
									{categories.map((category, index) => {
										const id =
											category?._id ||
											category?.id ||
											`category-${index}`;

										const subCategories = Array.isArray(
											category?.subCategories
										)
											? category.subCategories
											: [];

										const isDeleting = deletingId === id;

										return (
											<tr
												key={id}
												className="border-b border-gray-800 bg-[#0e0e11] hover:bg-[#16161c]">
												{/* NAME */}
												<td className="p-4 align-top">
													<div className="font-medium text-white">
														{category?.name ||
															'Unnamed'}
													</div>
												</td>

												{/* SUBCATEGORIES */}
												<td className="p-4 align-top">
													{subCategories.length >
													0 ? (
														<div className="flex flex-wrap gap-2">
															{subCategories.map(
																(
																	sub,
																	subIndex
																) => (
																	<span
																		key={`${sub}-${subIndex}`}
																		className="rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
																		{sub}
																	</span>
																)
															)}
														</div>
													) : (
														<span className="text-sm text-gray-600">
															No subcategories
														</span>
													)}
												</td>

												{/* ACTIONS */}
												<td className="p-4 align-top">
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={() =>
																handleEdit(
																	category
																)
															}
															disabled={
																isDeleting ||
																saving
															}
															className="rounded-md bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50">
															Edit
														</button>

														<button
															type="button"
															onClick={() =>
																handleDelete(id)
															}
															disabled={
																isDeleting ||
																saving
															}
															className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
															{isDeleting
																? 'Deleting...'
																: 'Delete'}
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* MODAL */}
			{showModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget && !saving) {
							handleCancel();
						}
					}}>
					<div
						className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-700 bg-[#1a1a1f] p-6 shadow-2xl"
						role="dialog"
						aria-modal="true">
						<div className="mb-5 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-white">
								{editingCategory
									? 'Edit Category'
									: 'Add Category'}
							</h3>

							<button
								type="button"
								onClick={handleCancel}
								disabled={saving}
								className="rounded-md p-1 text-xl text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50">
								✕
							</button>
						</div>

						<CategoryForm
							onSubmit={handleSubmit}
							editingCategory={editingCategory}
							onCancel={handleCancel}
							loading={saving}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
