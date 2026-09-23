'use client';

import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

const emptyForm = {
	title: '',
	slug: '',
	excerpt: '',
	content: '',
	featuredImage: '',
	category: 'Food & Nutrition',
	tags: '',
	author: 'Shalban Food',
	seoTitle: '',
	seoDescription: '',
	keywords: '',
	canonicalUrl: '',
	status: 'draft',
};

export default function BlogForm({
	editingBlog,
	onSubmit,
	onCancel,
	loading = false,
}) {
	const [form, setForm] = useState(emptyForm);

	useEffect(() => {
		if (editingBlog) {
			setForm({
				title: editingBlog.title || '',
				slug: editingBlog.slug || '',
				excerpt: editingBlog.excerpt || '',
				content: editingBlog.content || '',
				featuredImage: editingBlog.featuredImage || '',
				category: editingBlog.category || 'Food & Nutrition',
				tags: editingBlog.tags?.join(', ') || '',
				author: editingBlog.author || 'Shalban Food',
				seoTitle: editingBlog.seoTitle || editingBlog.title || '',
				seoDescription:
					editingBlog.seoDescription || editingBlog.excerpt || '',
				keywords: editingBlog.keywords?.join(', ') || '',
				canonicalUrl: editingBlog.canonicalUrl || '',
				status: editingBlog.status || 'draft',
			});
		} else {
			setForm(emptyForm);
		}
	}, [editingBlog]);

	function handleChange(e) {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	function handleSubmit(e) {
		e.preventDefault();

		onSubmit({
			...form,

			tags: form.tags
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),

			keywords: form.keywords
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5 rounded-2xl border border-zinc-800 bg-[#131318] p-5">
			<div>
				<label className="mb-2 block text-sm">Blog Title</label>

				<input
					name="title"
					value={form.title}
					onChange={handleChange}
					required
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
					placeholder="সরিষা ফুলের মধু: স্বাদ, ঘ্রাণ ও ব্যবহার"
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Slug</label>

				<input
					name="slug"
					value={form.slug}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="mustard-flower-honey"
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Excerpt</label>

				<textarea
					name="excerpt"
					value={form.excerpt}
					onChange={handleChange}
					rows={3}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="সংক্ষিপ্ত ব্লগ বিবরণ..."
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Featured Image URL</label>

				<input
					name="featuredImage"
					value={form.featuredImage}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="https://..."
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Content</label>

				<textarea
					name="content"
					value={form.content}
					onChange={handleChange}
					required
					rows={18}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm"
					placeholder="Blog HTML content..."
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<label className="mb-2 block text-sm">Category</label>

					<input
						name="category"
						value={form.category}
						onChange={handleChange}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm">Author</label>

					<input
						name="author"
						value={form.author}
						onChange={handleChange}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					/>
				</div>
			</div>

			<div>
				<label className="mb-2 block text-sm">Tags</label>

				<input
					name="tags"
					value={form.tags}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="মধু, সরিষা ফুলের মধু, Natural Honey"
				/>
			</div>

			<hr className="border-zinc-800" />

			<h3 className="text-lg font-semibold">SEO Settings</h3>

			<div>
				<label className="mb-2 block text-sm">SEO Title</label>

				<input
					name="seoTitle"
					value={form.seoTitle}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">SEO Description</label>

				<textarea
					name="seoDescription"
					value={form.seoDescription}
					onChange={handleChange}
					rows={3}
					maxLength={160}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Keywords</label>

				<input
					name="keywords"
					value={form.keywords}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="mustard flower honey, সরিষা ফুলের মধু"
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Canonical URL</label>

				<input
					name="canonicalUrl"
					value={form.canonicalUrl}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3"
					placeholder="https://shalbanfood.com/blog/..."
				/>
			</div>

			<div>
				<label className="mb-2 block text-sm">Status</label>

				<select
					name="status"
					value={form.status}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={loading}
					className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium hover:bg-green-700 disabled:opacity-50">
					<Save size={18} />

					{loading
						? 'Saving...'
						: editingBlog
							? 'Update Blog'
							: 'Publish Blog'}
				</button>

				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3">
						<X size={18} />
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
