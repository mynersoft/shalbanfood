'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, FileText } from 'lucide-react';

import BlogForm from '@/components/dashboard/BlogForm';

export default function AdminBlogsPage() {
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [showForm, setShowForm] = useState(false);
	const [editingBlog, setEditingBlog] = useState(null);

	async function loadBlogs() {
		try {
			setLoading(true);

			const response = await fetch('/api/blogs', {
				cache: 'no-store',
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to load blogs');
			}

			setBlogs(data.blogs || []);
		} catch (error) {
			console.error(error);
			alert(error.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadBlogs();
	}, []);

	async function handleSave(blogData) {
		try {
			setSaving(true);

			const isEditing = Boolean(editingBlog);

			const url = isEditing
				? `/api/blogs/${editingBlog._id}`
				: '/api/blogs';

			const response = await fetch(url, {
				method: isEditing ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(blogData),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to save blog');
			}

			alert(
				isEditing
					? 'Blog updated successfully'
					: 'Blog created successfully'
			);

			setShowForm(false);
			setEditingBlog(null);

			await loadBlogs();
		} catch (error) {
			console.error(error);
			alert(error.message);
		} finally {
			setSaving(false);
		}
	}

	function handleEdit(blog) {
		setEditingBlog(blog);
		setShowForm(true);
	}

	function handleCreate() {
		setEditingBlog(null);
		setShowForm(true);
	}

	async function handleDelete(id) {
		const confirmed = window.confirm(
			'এই blog এবং এর Cloudinary image delete করতে চান?'
		);

		if (!confirmed) return;

		try {
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Delete failed');
			}

			alert('Blog deleted successfully');

			await loadBlogs();
		} catch (error) {
			console.error(error);
			alert(error.message);
		}
	}

	if (showForm) {
		return (
			<div className="min-h-screen bg-[#0b0b0f] p-4 text-white md:p-6">
				<div className="mx-auto max-w-5xl">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">
								{editingBlog ? 'Edit Blog' : 'Create Blog'}
							</h1>

							<p className="mt-1 text-sm text-zinc-500">
								Shalban Food Blog
							</p>
						</div>

						<button
							type="button"
							onClick={() => {
								setShowForm(false);
								setEditingBlog(null);
							}}
							className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2">
							<X size={18} />
							Back
						</button>
					</div>

					<BlogForm
						editingBlog={editingBlog}
						onSubmit={handleSave}
						onCancel={() => {
							setShowForm(false);
							setEditingBlog(null);
						}}
						loading={saving}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0b0b0f] p-4 text-white md:p-6">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Blog Management</h1>

						<p className="mt-1 text-sm text-zinc-500">
							Create, edit and manage Shalban Food blogs
						</p>
					</div>

					<button
						type="button"
						onClick={handleCreate}
						className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium hover:bg-green-700">
						<Plus size={18} />
						New Blog
					</button>
				</div>

				{loading ? (
					<div className="flex min-h-[300px] items-center justify-center">
						<Loader2 size={32} className="animate-spin" />
					</div>
				) : blogs.length === 0 ? (
					<div className="rounded-2xl border border-zinc-800 bg-[#131318] p-10 text-center">
						<FileText
							size={40}
							className="mx-auto mb-4 text-zinc-600"
						/>

						<h2 className="text-lg font-semibold">
							No blogs found
						</h2>

						<p className="mt-2 text-sm text-zinc-500">
							Create your first Shalban Food blog.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{blogs.map((blog) => (
							<div
								key={blog._id}
								className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#131318]">
								<div className="flex flex-col gap-4 p-4 md:flex-row">
									{blog.featuredImage ? (
										<img
											src={blog.featuredImage}
											alt={blog.title}
											className="h-32 w-full rounded-xl object-cover md:w-48"
										/>
									) : (
										<div className="flex h-32 w-full items-center justify-center rounded-xl bg-zinc-900 md:w-48">
											<FileText className="text-zinc-600" />
										</div>
									)}

									<div className="min-w-0 flex-1">
										<div className="mb-2 flex flex-wrap items-center gap-2">
											<span
												className={`rounded-full px-3 py-1 text-xs ${
													blog.status === 'published'
														? 'bg-green-900/40 text-green-400'
														: 'bg-yellow-900/40 text-yellow-400'
												}`}>
												{blog.status}
											</span>

											<span className="text-xs text-zinc-500">
												{blog.category}
											</span>
										</div>

										<h2 className="text-lg font-semibold">
											{blog.title}
										</h2>

										<p className="mt-2 line-clamp-2 text-sm text-zinc-400">
											{blog.excerpt}
										</p>

										<p className="mt-2 text-xs text-zinc-600">
											/{blog.slug}
										</p>
									</div>

									<div className="flex shrink-0 items-center gap-2 md:flex-col md:justify-center">
										<button
											type="button"
											onClick={() => handleEdit(blog)}
											className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
											<Edit size={16} />
											Edit
										</button>

										<button
											type="button"
											onClick={() =>
												handleDelete(blog._id)
											}
											className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm hover:bg-red-700">
											<Trash2 size={16} />
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
