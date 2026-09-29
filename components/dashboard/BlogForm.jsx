'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

const emptyForm = {
	title: '',
	slug: '',
	excerpt: '',
	content: '',
	featuredImage: '',
	featuredImagePublicId: '',
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
	const [uploadingImage, setUploadingImage] = useState(false);
	const [uploadError, setUploadError] = useState('');

	const fileInputRef = useRef(null);

	/*
	|--------------------------------------------------------------------------
	| Load existing blog when editing
	|--------------------------------------------------------------------------
	*/

	useEffect(() => {
		if (editingBlog) {
			setForm({
				title: editingBlog.title || '',
				slug: editingBlog.slug || '',
				excerpt: editingBlog.excerpt || '',
				content: editingBlog.content || '',
				featuredImage: editingBlog.featuredImage || '',
				featuredImagePublicId: editingBlog.featuredImagePublicId || '',
				category: editingBlog.category || 'Food & Nutrition',
				tags: Array.isArray(editingBlog.tags)
					? editingBlog.tags.join(', ')
					: '',
				author: editingBlog.author || 'Shalban Food',
				seoTitle: editingBlog.seoTitle || editingBlog.title || '',
				seoDescription:
					editingBlog.seoDescription || editingBlog.excerpt || '',
				keywords: Array.isArray(editingBlog.keywords)
					? editingBlog.keywords.join(', ')
					: '',
				canonicalUrl: editingBlog.canonicalUrl || '',
				status: editingBlog.status || 'draft',
			});
		} else {
			setForm(emptyForm);
		}

		setUploadError('');

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [editingBlog]);

	/*
	|--------------------------------------------------------------------------
	| Input change
	|--------------------------------------------------------------------------
	*/

	function handleChange(e) {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	/*
	|--------------------------------------------------------------------------
	| Generate slug
	|--------------------------------------------------------------------------
	*/

	function generateSlug(text) {
		return String(text)
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function handleTitleChange(e) {
		const value = e.target.value;

		setForm((prev) => ({
			...prev,
			title: value,
		}));
	}

	function handleGenerateSlug() {
		if (!form.title.trim()) return;

		setForm((prev) => ({
			...prev,
			slug: generateSlug(prev.title),
		}));
	}

	/*
	|--------------------------------------------------------------------------
	| Cloudinary image upload
	|--------------------------------------------------------------------------
	*/

	async function handleImageUpload(e) {
		const file = e.target.files?.[0];

		if (!file) return;

		setUploadError('');

		/*
		|--------------------------------------------------------------------------
		| Validate file
		|--------------------------------------------------------------------------
		*/

		if (!file.type.startsWith('image/')) {
			setUploadError('শুধু image file upload করা যাবে।');

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}

			return;
		}

		/*
		|--------------------------------------------------------------------------
		| Max 5MB
		|--------------------------------------------------------------------------
		*/

		if (file.size > 5 * 1024 * 1024) {
			setUploadError('Image size সর্বোচ্চ 5MB হতে পারবে।');

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}

			return;
		}

		try {
			setUploadingImage(true);

			const formData = new FormData();

			formData.append('file', file);

			/*
			|--------------------------------------------------------------------------
			| IMPORTANT
			| Do NOT manually set Content-Type.
			| Browser will set multipart/form-data boundary.
			|--------------------------------------------------------------------------
			*/

			const response = await fetch('/api/upload/blog', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Image upload failed');
			}

			setForm((prev) => ({
				...prev,
				featuredImage: data.url || '',
				featuredImagePublicId: data.public_id || '',
			}));
		} catch (error) {
			console.error('Blog image upload error:', error);

			setUploadError(error.message || 'Image upload করতে সমস্যা হয়েছে।');
		} finally {
			setUploadingImage(false);

			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Remove image
	|--------------------------------------------------------------------------
	*/

	function removeImage() {
		setForm((prev) => ({
			...prev,
			featuredImage: '',
			featuredImagePublicId: '',
		}));

		setUploadError('');

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}

	/*
	|--------------------------------------------------------------------------
	| Submit
	|--------------------------------------------------------------------------
	*/

	function handleSubmit(e) {
		e.preventDefault();

		if (!form.title.trim()) {
			setUploadError('Blog title দিন।');
			return;
		}

		if (!form.content.trim()) {
			setUploadError('Blog content দিন।');
			return;
		}

		const blogData = {
			...form,

			title: form.title.trim(),

			slug: form.slug.trim(),

			excerpt: form.excerpt.trim(),

			content: form.content.trim(),

			category: form.category.trim(),

			author: form.author.trim(),

			seoTitle: form.seoTitle.trim(),

			seoDescription: form.seoDescription.trim(),

			canonicalUrl: form.canonicalUrl.trim(),

			tags: form.tags
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),

			keywords: form.keywords
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
		};

		onSubmit(blogData);
	}

	/*
	|--------------------------------------------------------------------------
	| Character counts
	|--------------------------------------------------------------------------
	*/

	const titleLength = form.title.length;
	const descriptionLength = form.seoDescription.length;

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 rounded-2xl border border-zinc-800 bg-[#131318] p-5 text-white md:p-6">
			{/* =========================================================
			    BASIC INFORMATION
			========================================================= */}

			<div>
				<h2 className="text-xl font-semibold">Blog Information</h2>

				<p className="mt-1 text-sm text-zinc-500">
					Create SEO-friendly Shalban Food blog content.
				</p>
			</div>

			{/* Title */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					Blog Title *
				</label>

				<input
					name="title"
					value={form.title}
					onChange={handleTitleChange}
					required
					maxLength={200}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-green-500"
					placeholder="কালোজিরা ফুলের মধু: উপকারিতা, ব্যবহার ও সংরক্ষণ"
				/>

				<p className="mt-1 text-xs text-zinc-500">{titleLength}/200</p>
			</div>

			{/* Slug */}

			<div>
				<div className="mb-2 flex items-center justify-between">
					<label className="block text-sm font-medium">Slug</label>

					<button
						type="button"
						onClick={handleGenerateSlug}
						className="text-xs text-green-400 hover:text-green-300">
						Generate from title
					</button>
				</div>

				<input
					name="slug"
					value={form.slug}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="kalojira-flower-honey"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					Example: /blog/kalojira-flower-honey
				</p>
			</div>

			{/* Excerpt */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					Excerpt
				</label>

				<textarea
					name="excerpt"
					value={form.excerpt}
					onChange={handleChange}
					rows={4}
					maxLength={500}
					className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="কালোজিরা ফুলের মধুর স্বাদ, ঘ্রাণ, ব্যবহার এবং সংরক্ষণ সম্পর্কে বিস্তারিত জানুন..."
				/>

				<p className="mt-1 text-xs text-zinc-500">
					{form.excerpt.length}/500
				</p>
			</div>

			{/* =========================================================
			    FEATURED IMAGE
			========================================================= */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					Featured Image
				</label>

				<div className="space-y-4">
					{/* Upload Box */}

					<div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-900/70 p-6">
						<div className="flex flex-col items-center justify-center text-center">
							<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
								<ImageIcon
									size={26}
									className="text-zinc-400"
								/>
							</div>

							<p className="mb-1 text-sm font-medium">
								Featured image upload করুন
							</p>

							<p className="mb-4 text-xs text-zinc-500">
								JPG, JPEG, PNG অথবা WEBP
								<br />
								সর্বোচ্চ 5MB
							</p>

							<input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp,image/jpg"
								onChange={handleImageUpload}
								disabled={uploadingImage || loading}
								className="hidden"
								id="blog-image-upload"
							/>

							<label
								htmlFor="blog-image-upload"
								className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition ${
									uploadingImage || loading
										? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
										: 'cursor-pointer bg-green-600 hover:bg-green-700'
								}`}>
								{uploadingImage ? (
									<>
										<Loader2
											size={18}
											className="animate-spin"
										/>
										Uploading...
									</>
								) : (
									<>
										<Upload size={18} />
										Choose Image
									</>
								)}
							</label>
						</div>
					</div>

					{/* Upload Error */}

					{uploadError && (
						<div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
							{uploadError}
						</div>
					)}

					{/* Image Preview */}

					{form.featuredImage && (
						<div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
							<div className="relative">
								<img
									src={form.featuredImage}
									alt={form.title || 'Blog featured image'}
									className="max-h-[450px] w-full object-cover"
								/>

								<button
									type="button"
									onClick={removeImage}
									disabled={uploadingImage || loading}
									className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
									<X size={16} />
									Remove
								</button>
							</div>

							<div className="border-t border-zinc-800 px-4 py-3">
								<p className="truncate text-xs text-zinc-500">
									{form.featuredImage}
								</p>
							</div>
						</div>
					)}

					{/* Manual URL */}

					<div>
						<label className="mb-2 block text-xs text-zinc-400">
							অথবা Image URL manually দিন
						</label>

						<input
							name="featuredImage"
							value={form.featuredImage}
							onChange={(e) => {
								setForm((prev) => ({
									...prev,
									featuredImage: e.target.value,
									featuredImagePublicId: '',
								}));
							}}
							className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-green-500"
							placeholder="https://res.cloudinary.com/..."
						/>
					</div>
				</div>
			</div>

			{/* =========================================================
			    CONTENT
			========================================================= */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					Blog Content *
				</label>

				<textarea
					name="content"
					value={form.content}
					onChange={handleChange}
					required
					rows={20}
					className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-green-500"
					placeholder="<p>কালোজিরা ফুলের মধু...</p>"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					HTML content supported.
				</p>
			</div>

			{/* =========================================================
			    CATEGORY + AUTHOR
			========================================================= */}

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<label className="mb-2 block text-sm font-medium">
						Category
					</label>

					<input
						name="category"
						value={form.category}
						onChange={handleChange}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
						placeholder="Food & Nutrition"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium">
						Author
					</label>

					<input
						name="author"
						value={form.author}
						onChange={handleChange}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
						placeholder="Shalban Food"
					/>
				</div>
			</div>

			{/* =========================================================
			    TAGS
			========================================================= */}

			<div>
				<label className="mb-2 block text-sm font-medium">Tags</label>

				<input
					name="tags"
					value={form.tags}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="মধু, কালোজিরা ফুলের মধু, Natural Honey, Honey"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					Comma দিয়ে আলাদা করুন।
				</p>
			</div>

			{/* =========================================================
			    SEO
			========================================================= */}

			<div className="border-t border-zinc-800 pt-6">
				<h3 className="text-lg font-semibold">SEO Settings</h3>

				<p className="mt-1 text-sm text-zinc-500">
					Google search-এর জন্য SEO information দিয়ে দিন।
				</p>
			</div>

			{/* SEO Title */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					SEO Title
				</label>

				<input
					name="seoTitle"
					value={form.seoTitle}
					onChange={handleChange}
					maxLength={70}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="কালোজিরা ফুলের মধু | উপকারিতা ও ব্যবহার | Shalban Food"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					{form.seoTitle.length}/70
				</p>
			</div>

			{/* SEO Description */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					SEO Description
				</label>

				<textarea
					name="seoDescription"
					value={form.seoDescription}
					onChange={handleChange}
					rows={4}
					maxLength={160}
					className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="কালোজিরা ফুলের মধুর উপকারিতা, ব্যবহার, স্বাদ, ঘ্রাণ ও সংরক্ষণ সম্পর্কে বিস্তারিত জানুন।"
				/>

				<p
					className={`mt-1 text-xs ${
						descriptionLength > 155
							? 'text-yellow-400'
							: 'text-zinc-500'
					}`}>
					{descriptionLength}/160
				</p>
			</div>

			{/* Keywords */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					SEO Keywords
				</label>

				<input
					name="keywords"
					value={form.keywords}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="কালোজিরা ফুলের মধু, kalojira flower honey, কালোজিরা মধু"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					Comma দিয়ে আলাদা করুন।
				</p>
			</div>

			{/* Canonical */}

			<div>
				<label className="mb-2 block text-sm font-medium">
					Canonical URL
				</label>

				<input
					name="canonicalUrl"
					value={form.canonicalUrl}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500"
					placeholder="https://shalbanfood.com/blog/kalojira-flower-honey"
				/>

				<p className="mt-1 text-xs text-zinc-500">
					খালি রাখলে automatic canonical ব্যবহার করতে পারবে।
				</p>
			</div>

			{/* =========================================================
			    STATUS
			========================================================= */}

			<div>
				<label className="mb-2 block text-sm font-medium">Status</label>

				<select
					name="status"
					value={form.status}
					onChange={handleChange}
					className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-green-500">
					<option value="draft">Draft</option>

					<option value="published">Published</option>
				</select>
			</div>

			{/* =========================================================
			    BUTTONS
			========================================================= */}

			<div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
				<button
					type="submit"
					disabled={loading || uploadingImage}
					className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
					{loading ? (
						<>
							<Loader2 size={18} className="animate-spin" />

							{editingBlog ? 'Updating...' : 'Saving...'}
						</>
					) : (
						<>
							<Save size={18} />

							{editingBlog ? 'Update Blog' : 'Save Blog'}
						</>
					)}
				</button>

				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={loading || uploadingImage}
						className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-medium transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50">
						<X size={18} />
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}
