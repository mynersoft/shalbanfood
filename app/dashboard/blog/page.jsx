'use client';

import { useState } from 'react';
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Eye,
	FileText,
	X,
	RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import BlogForm from '../../../../components/blog/BlogForm';

import {
	useBlogs,
	useCreateBlog,
	useUpdateBlog,
	useDeleteBlog,
} from '../../../../hooks/useBlogs';

export default function AdminBlogsPage() {
	const [showForm, setShowForm] = useState(false);
	const [editingBlog, setEditingBlog] = useState(null);

	const [search, setSearch] = useState('');
	const [searchValue, setSearchValue] = useState('');

	const [status, setStatus] = useState('');

	const [page, setPage] = useState(1);

	const { data, isLoading, isFetching, refetch } = useBlogs({
		search,
		status,
		page,
		limit: 10,
	});

	const createBlog = useCreateBlog();
	const updateBlog = useUpdateBlog();
	const deleteBlog = useDeleteBlog();

	const blogs = data?.data || [];

	const pagination = data?.pagination || {
		page: 1,
		total: 0,
		totalPages: 1,
	};

	function openCreateForm() {
		setEditingBlog(null);
		setShowForm(true);
	}

	function openEditForm(blog) {
		setEditingBlog(blog);
		setShowForm(true);
	}

	function closeForm() {
		setEditingBlog(null);
		setShowForm(false);
	}

	async function handleSubmit(formData) {
		try {
			if (editingBlog) {
				await updateBlog.mutateAsync({
					id: editingBlog._id,
					data: formData,
				});

				toast.success('Blog updated successfully');
			} else {
				await createBlog.mutateAsync(formData);

				toast.success('Blog created successfully');
			}

			closeForm();
			refetch();
		} catch (error) {
			toast.error(error.message || 'Something went wrong');
		}
	}

	async function handleDelete(blog) {
		const confirmed = window.confirm(`Delete "${blog.title}"?`);

		if (!confirmed) return;

		try {
			await deleteBlog.mutateAsync(blog._id);

			toast.success('Blog deleted successfully');

			refetch();
		} catch (error) {
			toast.error(error.message || 'Failed to delete blog');
		}
	}

	function handleSearch(e) {
		e.preventDefault();

		setPage(1);
		setSearch(searchValue.trim());
	}

	function clearSearch() {
		setSearchValue('');
		setSearch('');
		setPage(1);
	}

	return (
		<div className="min-h-screen bg-[#0b0b0f] p-4 text-white md:p-6">
			{/* Header */}

			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600/15 text-green-500">
							<FileText size={23} />
						</div>

						<div>
							<h1 className="text-2xl font-bold">
								Blog Management
							</h1>

							<p className="text-sm text-zinc-500">
								Create, edit and manage Shalban Food articles
							</p>
						</div>
					</div>
				</div>

				<button
					onClick={openCreateForm}
					className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium transition hover:bg-green-700">
					<Plus size={19} />
					Add Blog
				</button>
			</div>

			{/* Stats */}

			<div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
				<StatCard
					title="Total Blogs"
					value={pagination.total || 0}
					icon={<FileText size={19} />}
				/>

				<StatCard
					title="Published"
					value={
						blogs.filter((blog) => blog.status === 'published')
							.length
					}
					icon={<Eye size={19} />}
				/>

				<StatCard
					title="Drafts"
					value={
						blogs.filter((blog) => blog.status === 'draft').length
					}
					icon={<FileText size={19} />}
				/>

				<StatCard
					title="Page"
					value={`${pagination.page || 1}/${pagination.totalPages || 1}`}
					icon={<RefreshCw size={19} />}
				/>
			</div>

			{/* Search + Filters */}

			<div className="mb-6 rounded-2xl border border-zinc-800 bg-[#131318] p-4">
				<div className="flex flex-col gap-3 lg:flex-row">
					<form onSubmit={handleSearch} className="flex flex-1 gap-2">
						<div className="relative flex-1">
							<Search
								size={18}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
							/>

							<input
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								placeholder="Search blog title, tags..."
								className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-600"
							/>
						</div>

						<button
							type="submit"
							className="rounded-xl bg-zinc-800 px-5 text-sm font-medium hover:bg-zinc-700">
							Search
						</button>

						{search && (
							<button
								type="button"
								onClick={clearSearch}
								className="flex items-center gap-1 rounded-xl border border-zinc-700 px-4 text-sm hover:bg-zinc-800">
								<X size={16} />
								Clear
							</button>
						)}
					</form>

					<select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value);
							setPage(1);
						}}
						className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none">
						<option value="">All Status</option>
						<option value="published">Published</option>
						<option value="draft">Draft</option>
					</select>

					<button
						onClick={() => refetch()}
						disabled={isFetching}
						className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm hover:bg-zinc-800 disabled:opacity-50">
						<RefreshCw
							size={17}
							className={isFetching ? 'animate-spin' : ''}
						/>
						Refresh
					</button>
				</div>
			</div>

			{/* Blog Form */}

			{showForm && (
				<div className="mb-6">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-lg font-semibold">
							{editingBlog ? 'Edit Blog' : 'Create New Blog'}
						</h2>

						<button
							onClick={closeForm}
							className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
							<X size={20} />
						</button>
					</div>

					<BlogForm
						editingBlog={editingBlog}
						onSubmit={handleSubmit}
						onCancel={closeForm}
						loading={createBlog.isPending || updateBlog.isPending}
					/>
				</div>
			)}

			{/* Blog Table */}

			<div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#131318]">
				<div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
					<div>
						<h2 className="font-semibold">All Blogs</h2>

						<p className="mt-1 text-xs text-zinc-500">
							{pagination.total || 0} total articles
						</p>
					</div>
				</div>

				{isLoading ? (
					<LoadingState />
				) : blogs.length === 0 ? (
					<EmptyState onAdd={openCreateForm} />
				) : (
					<>
						{/* Desktop */}

						<div className="hidden overflow-x-auto md:block">
							<table className="w-full text-left">
								<thead className="border-b border-zinc-800 bg-zinc-900/50">
									<tr>
										<th className="px-5 py-4 text-xs font-medium uppercase text-zinc-500">
											Blog
										</th>

										<th className="px-5 py-4 text-xs font-medium uppercase text-zinc-500">
											Category
										</th>

										<th className="px-5 py-4 text-xs font-medium uppercase text-zinc-500">
											Status
										</th>

										<th className="px-5 py-4 text-xs font-medium uppercase text-zinc-500">
											Date
										</th>

										<th className="px-5 py-4 text-right text-xs font-medium uppercase text-zinc-500">
											Actions
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-zinc-800">
									{blogs.map((blog) => (
										<BlogRow
											key={blog._id}
											blog={blog}
											onEdit={openEditForm}
											onDelete={handleDelete}
										/>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile */}

						<div className="divide-y divide-zinc-800 md:hidden">
							{blogs.map((blog) => (
								<MobileBlogCard
									key={blog._id}
									blog={blog}
									onEdit={openEditForm}
									onDelete={handleDelete}
								/>
							))}
						</div>
					</>
				)}

				{/* Pagination */}

				{pagination.totalPages > 1 && (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						onChange={setPage}
					/>
				)}
			</div>
		</div>
	);
}

/* -----------------------------
   Stat Card
------------------------------ */

function StatCard({ title, value, icon }) {
	return (
		<div className="rounded-2xl border border-zinc-800 bg-[#131318] p-4">
			<div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/10 text-green-500">
				{icon}
			</div>

			<p className="text-xs text-zinc-500">{title}</p>

			<p className="mt-1 text-xl font-bold">{value}</p>
		</div>
	);
}

/* -----------------------------
   Desktop Row
------------------------------ */

function BlogRow({ blog, onEdit, onDelete }) {
	return (
		<tr className="transition hover:bg-zinc-900/40">
			<td className="max-w-md px-5 py-4">
				<div className="flex items-center gap-3">
					{blog.featuredImage ? (
						<img
							src={blog.featuredImage}
							alt={blog.title}
							className="h-14 w-20 rounded-lg object-cover"
						/>
					) : (
						<div className="flex h-14 w-20 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
							<FileText size={20} />
						</div>
					)}

					<div className="min-w-0">
						<h3 className="truncate font-medium">{blog.title}</h3>

						<p className="mt-1 truncate text-xs text-zinc-500">
							/blog/{blog.slug}
						</p>
					</div>
				</div>
			</td>

			<td className="px-5 py-4">
				<span className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
					{blog.category || 'General'}
				</span>
			</td>

			<td className="px-5 py-4">
				<StatusBadge status={blog.status} />
			</td>

			<td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500">
				{formatDate(blog.createdAt)}
			</td>

			<td className="px-5 py-4">
				<div className="flex justify-end gap-2">
					<a
						href={`/blog/${blog.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
						title="View">
						<Eye size={18} />
					</a>

					<button
						onClick={() => onEdit(blog)}
						className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10"
						title="Edit">
						<Edit size={18} />
					</button>

					<button
						onClick={() => onDelete(blog)}
						className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
						title="Delete">
						<Trash2 size={18} />
					</button>
				</div>
			</td>
		</tr>
	);
}

/* -----------------------------
   Mobile Card
------------------------------ */

function MobileBlogCard({ blog, onEdit, onDelete }) {
	return (
		<div className="p-4">
			<div className="flex gap-3">
				{blog.featuredImage ? (
					<img
						src={blog.featuredImage}
						alt={blog.title}
						className="h-20 w-24 shrink-0 rounded-xl object-cover"
					/>
				) : (
					<div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
						<FileText size={22} />
					</div>
				)}

				<div className="min-w-0 flex-1">
					<h3 className="line-clamp-2 font-medium">{blog.title}</h3>

					<p className="mt-1 text-xs text-zinc-500">
						{blog.category}
					</p>

					<div className="mt-2">
						<StatusBadge status={blog.status} />
					</div>
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
				<span className="text-xs text-zinc-500">
					{formatDate(blog.createdAt)}
				</span>

				<div className="flex gap-1">
					<a
						href={`/blog/${blog.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
						<Eye size={17} />
					</a>

					<button
						onClick={() => onEdit(blog)}
						className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10">
						<Edit size={17} />
					</button>

					<button
						onClick={() => onDelete(blog)}
						className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
						<Trash2 size={17} />
					</button>
				</div>
			</div>
		</div>
	);
}

/* -----------------------------
   Status
------------------------------ */

function StatusBadge({ status }) {
	if (status === 'published') {
		return (
			<span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
				Published
			</span>
		);
	}

	return (
		<span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
			Draft
		</span>
	);
}

/* -----------------------------
   Pagination
------------------------------ */

function Pagination({ page, totalPages, onChange }) {
	return (
		<div className="flex items-center justify-center gap-2 border-t border-zinc-800 p-4">
			<button
				disabled={page <= 1}
				onClick={() => onChange(page - 1)}
				className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30">
				Previous
			</button>

			<span className="rounded-lg bg-zinc-800 px-4 py-2 text-sm">
				{page} / {totalPages}
			</span>

			<button
				disabled={page >= totalPages}
				onClick={() => onChange(page + 1)}
				className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-30">
				Next
			</button>
		</div>
	);
}

/* -----------------------------
   Loading
------------------------------ */

function LoadingState() {
	return (
		<div className="space-y-3 p-5">
			{[1, 2, 3, 4].map((item) => (
				<div
					key={item}
					className="h-20 animate-pulse rounded-xl bg-zinc-900"
				/>
			))}
		</div>
	);
}

/* -----------------------------
   Empty
------------------------------ */

function EmptyState({ onAdd }) {
	return (
		<div className="flex flex-col items-center justify-center px-5 py-20 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500">
				<FileText size={28} />
			</div>

			<h3 className="text-lg font-semibold">No blogs found</h3>

			<p className="mt-1 max-w-sm text-sm text-zinc-500">
				Start creating useful food and nutrition articles for Shalban
				Food.
			</p>

			<button
				onClick={onAdd}
				className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium hover:bg-green-700">
				<Plus size={18} />
				Create First Blog
			</button>
		</div>
	);
}

/* -----------------------------
   Date
------------------------------ */

function formatDate(date) {
	if (!date) return '-';

	try {
		return new Date(date).toLocaleDateString('bn-BD', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch {
		return '-';
	}
}
