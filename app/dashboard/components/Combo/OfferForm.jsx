'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const createDefaultForm = () => ({
	name: '',
	slug: '',
	shortDescription: '',
	description: '',
	items: [
		{ name: '', quantity: '' },
		{ name: '', quantity: '' },
	],
	regularPrice: '',
	offerPrice: '',
	featureImg: '',
	images: [],
	stock: 0,
	startDate: '',
	endDate: '',
	isActive: true,
	isFeatured: false,
	priority: 0,
	seoTitle: '',
	seoDescription: '',
	keywords: '',
});

function slugify(text) {
	return text
		.toString()
		.normalize('NFKC')
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function formatDateTimeLocal(value) {
	if (!value) return '';

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return '';

	const offset = date.getTimezoneOffset() * 60000;

	return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const inputClass =
	'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600';

const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

export default function OfferForm({ offer = null }) {
	const router = useRouter();
	const isEdit = Boolean(offer);

	const [form, setForm] = useState(createDefaultForm);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		if (!offer) {
			setForm(createDefaultForm());
			return;
		}

		setForm({
			...createDefaultForm(),

			name: offer.name || '',
			slug: offer.slug || '',
			shortDescription: offer.shortDescription || '',
			description: offer.description || '',

			items:
				Array.isArray(offer.items) && offer.items.length >= 2
					? offer.items.map((item) => ({
							name: item.name || '',
							quantity: item.quantity || '',
						}))
					: createDefaultForm().items,

			regularPrice: offer.regularPrice ?? '',
			offerPrice: offer.offerPrice ?? '',
			featureImg: offer.featureImg || '',
			images: Array.isArray(offer.images) ? offer.images : [],

			stock: offer.stock ?? 0,

			startDate: formatDateTimeLocal(offer.startDate),
			endDate: formatDateTimeLocal(offer.endDate),

			isActive: offer.isActive ?? true,
			isFeatured: offer.isFeatured ?? false,
			priority: offer.priority ?? 0,

			seoTitle: offer.seoTitle || '',
			seoDescription: offer.seoDescription || '',
			keywords: Array.isArray(offer.keywords)
				? offer.keywords.join(', ')
				: '',
		});
	}, [offer]);

	const updateField = (field, value) => {
		setForm((previous) => ({
			...previous,
			[field]: value,
		}));
	};

	const handleNameChange = (value) => {
		setForm((previous) => ({
			...previous,
			name: value,
			slug: previous.slug ? previous.slug : slugify(value),
		}));
	};

	const updateItem = (index, field, value) => {
		setForm((previous) => ({
			...previous,
			items: previous.items.map((item, itemIndex) =>
				itemIndex === index ? { ...item, [field]: value } : item
			),
		}));
	};

	const addItem = () => {
		setForm((previous) => ({
			...previous,
			items: [...previous.items, { name: '', quantity: '' }],
		}));
	};

	const removeItem = (index) => {
		if (form.items.length <= 2) {
			toast.error('A combo needs at least 2 items');
			return;
		}

		setForm((previous) => ({
			...previous,
			items: previous.items.filter((_, itemIndex) => itemIndex !== index),
		}));
	};

	const uploadImage = async (file) => {
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image');
			return;
		}

		// Basic client-side file size limit: 5 MB.
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image size must be 5 MB or less');
			return;
		}

		setUploading(true);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload/combooffer', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (!response.ok || !data.success || !data.url) {
				throw new Error(data.message || 'Image upload failed');
			}

			updateField('featureImg', data.url);

			toast.success('Image uploaded successfully');
		} catch (error) {
			toast.error(error.message || 'Image upload failed');
		} finally {
			setUploading(false);
		}
	};

	const validate = () => {
		if (!form.name.trim()) {
			toast.error('Offer name is required');
			return false;
		}

		if (!form.slug.trim()) {
			toast.error('Slug is required');
			return false;
		}

		if (
			form.items.length < 2 ||
			form.items.some(
				(item) => !item.name.trim() || !item.quantity.trim()
			)
		) {
			toast.error('Complete all combo items');
			return false;
		}

		const regularPrice = Number(form.regularPrice);
		const offerPrice = Number(form.offerPrice);
		const stock = Number(form.stock);
		const priority = Number(form.priority);

		if (
			form.regularPrice === '' ||
			!Number.isFinite(regularPrice) ||
			regularPrice <= 0
		) {
			toast.error('Enter a valid regular price');
			return false;
		}

		if (
			form.offerPrice === '' ||
			!Number.isFinite(offerPrice) ||
			offerPrice < 0
		) {
			toast.error('Enter a valid offer price');
			return false;
		}

		if (offerPrice > regularPrice) {
			toast.error('Offer price cannot exceed regular price');
			return false;
		}

		if (!Number.isInteger(stock) || stock < 0) {
			toast.error('Stock must be a whole number');
			return false;
		}

		if (!Number.isInteger(priority)) {
			toast.error('Priority must be a whole number');
			return false;
		}

		if (!form.featureImg.trim()) {
			toast.error('Feature image is required');
			return false;
		}

		if (!form.startDate || !form.endDate) {
			toast.error('Start and end dates are required');
			return false;
		}

		const start = new Date(form.startDate);
		const end = new Date(form.endDate);

		if (
			Number.isNaN(start.getTime()) ||
			Number.isNaN(end.getTime()) ||
			end <= start
		) {
			toast.error('End date must be after start date');
			return false;
		}

		return true;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (loading || uploading) return;
		if (!validate()) return;

		setLoading(true);

		try {
			const payload = {
				name: form.name.trim(),
				slug: form.slug.trim().toLowerCase(),

				shortDescription: form.shortDescription.trim(),
				description: form.description.trim(),

				items: form.items.map((item) => ({
					name: item.name.trim(),
					quantity: item.quantity.trim(),
				})),

				regularPrice: Number(form.regularPrice),
				offerPrice: Number(form.offerPrice),

				featureImg: form.featureImg.trim(),
				images: form.images,

				stock: Number(form.stock),

				startDate: new Date(form.startDate).toISOString(),

				endDate: new Date(form.endDate).toISOString(),

				isActive: form.isActive,
				isFeatured: form.isFeatured,
				priority: Number(form.priority),

				seoTitle: form.seoTitle.trim(),
				seoDescription: form.seoDescription.trim(),

				keywords: form.keywords
					.split(',')
					.map((keyword) => keyword.trim())
					.filter(Boolean),
			};

			const url = isEdit
				? `/api/combooffer/${offer._id}`
				: '/api/combooffer';

			const response = await fetch(url, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to save offer');
			}

			toast.success(
				isEdit
					? 'Offer updated successfully'
					: 'Offer created successfully'
			);

			router.push('/dashboard/combo');
			router.refresh();
		} catch (error) {
			console.error('SAVE OFFER ERROR:', error);

			toast.error(error.message || 'Failed to save offer');
		} finally {
			setLoading(false);
		}
	};

	const regularPrice = Number(form.regularPrice);
	const offerPrice = Number(form.offerPrice);

	const discount =
		regularPrice > 0 && offerPrice >= 0
			? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
			: 0;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Basic information */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900">
					Basic Information
				</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-2">
					<div className="md:col-span-2">
						<label className={labelClass}>Offer Name *</label>

						<input
							required
							value={form.name}
							onChange={(event) =>
								handleNameChange(event.target.value)
							}
							placeholder="কালোজিরা মধু + গাওয়া ঘি কম্বো"
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Slug *</label>

						<input
							required
							value={form.slug}
							onChange={(event) =>
								updateField('slug', event.target.value)
							}
							placeholder="kalojira-honey-ghee-combo"
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Priority</label>

						<input
							type="number"
							step="1"
							value={form.priority}
							onChange={(event) =>
								updateField('priority', event.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div className="md:col-span-2">
						<label className={labelClass}>Short Description</label>

						<input
							maxLength={300}
							value={form.shortDescription}
							onChange={(event) =>
								updateField(
									'shortDescription',
									event.target.value
								)
							}
							placeholder="বিশেষ অফারে মধু ও গাওয়া ঘির কম্বো"
							className={inputClass}
						/>
					</div>

					<div className="md:col-span-2">
						<label className={labelClass}>Description</label>

						<textarea
							rows={5}
							value={form.description}
							onChange={(event) =>
								updateField('description', event.target.value)
							}
							placeholder="Offer details..."
							className={inputClass}
						/>
					</div>
				</div>
			</section>

			{/* Combo items */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-bold text-gray-900">
							Combo Items
						</h2>
						<p className="text-sm text-gray-500">
							Add the products and quantities in this combo.
						</p>
					</div>

					<button
						type="button"
						onClick={addItem}
						className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
						<Plus size={17} />
						Add Item
					</button>
				</div>

				<div className="mt-5 space-y-3">
					{form.items.map((item, index) => (
						<div
							key={index}
							className="grid gap-3 rounded-xl border bg-gray-50 p-3 md:grid-cols-[1fr_180px_auto]">
							<input
								required
								value={item.name}
								onChange={(event) =>
									updateItem(
										index,
										'name',
										event.target.value
									)
								}
								placeholder="যেমন: কালোজিরা ফুলের মধু"
								className={inputClass}
							/>

							<input
								required
								value={item.quantity}
								onChange={(event) =>
									updateItem(
										index,
										'quantity',
										event.target.value
									)
								}
								placeholder="যেমন: 500 গ্রাম"
								className={inputClass}
							/>

							<button
								type="button"
								onClick={() => removeItem(index)}
								aria-label={`Remove item ${index + 1}`}
								className="flex items-center justify-center rounded-xl border border-red-200 px-4 text-red-600 hover:bg-red-50">
								<Trash2 size={18} />
							</button>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900">Pricing</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-3">
					<div>
						<label className={labelClass}>
							Regular Price (৳) *
						</label>

						<input
							required
							type="number"
							min="1"
							step="0.01"
							value={form.regularPrice}
							onChange={(event) =>
								updateField('regularPrice', event.target.value)
							}
							placeholder="1500"
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Offer Price (৳) *</label>

						<input
							required
							type="number"
							min="0"
							step="0.01"
							value={form.offerPrice}
							onChange={(event) =>
								updateField('offerPrice', event.target.value)
							}
							placeholder="1200"
							className={inputClass}
						/>
					</div>

					<div className="flex items-end">
						<div className="w-full rounded-xl bg-green-50 p-4">
							<p className="text-sm text-green-700">Discount</p>

							<p className="text-2xl font-bold text-green-700">
								{discount > 0 ? `${discount}%` : '0%'}
							</p>

							{regularPrice > 0 &&
								offerPrice >= 0 &&
								offerPrice <= regularPrice && (
									<p className="text-sm text-green-700">
										সাশ্রয়: ৳
										{(
											regularPrice - offerPrice
										).toLocaleString('en-US')}
									</p>
								)}
						</div>
					</div>
				</div>
			</section>

			{/* Feature image */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900">
					Feature Image
				</h2>

				<div className="mt-5">
					{form.featureImg ? (
						<div className="relative max-w-md overflow-hidden rounded-2xl border">
							<img
								src={form.featureImg}
								alt={`${form.name || 'Offer'} feature`}
								className="aspect-square w-full object-cover"
							/>

							<button
								type="button"
								onClick={() => updateField('featureImg', '')}
								aria-label="Remove feature image"
								className="absolute right-3 top-3 rounded-full bg-white p-2 text-red-600 shadow">
								<X size={18} />
							</button>
						</div>
					) : (
						<label className="flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-500">
							<ImagePlus size={40} className="text-gray-400" />

							<span className="mt-3 text-sm font-semibold text-gray-700">
								{uploading
									? 'Uploading...'
									: 'Choose Feature Image'}
							</span>

							<span className="mt-1 text-xs text-gray-500">
								Maximum 5 MB
							</span>

							<input
								type="file"
								accept="image/*"
								className="hidden"
								disabled={uploading}
								onChange={(event) => {
									const file = event.target.files?.[0];

									uploadImage(file);

									event.target.value = '';
								}}
							/>
						</label>
					)}
				</div>
			</section>

			{/* Stock and schedule */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900">
					Stock & Schedule
				</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-3">
					<div>
						<label className={labelClass}>Stock</label>

						<input
							type="number"
							min="0"
							step="1"
							value={form.stock}
							onChange={(event) =>
								updateField('stock', event.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Start Date *</label>

						<input
							required
							type="datetime-local"
							value={form.startDate}
							onChange={(event) =>
								updateField('startDate', event.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>End Date *</label>

						<input
							required
							type="datetime-local"
							value={form.endDate}
							onChange={(event) =>
								updateField('endDate', event.target.value)
							}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="mt-5 flex flex-wrap gap-6">
					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(event) =>
								updateField('isActive', event.target.checked)
							}
							className="h-5 w-5 accent-green-700"
						/>

						<span className="text-sm font-semibold text-gray-700">
							Active Offer
						</span>
					</label>

					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={form.isFeatured}
							onChange={(event) =>
								updateField('isFeatured', event.target.checked)
							}
							className="h-5 w-5 accent-green-700"
						/>

						<span className="text-sm font-semibold text-gray-700">
							Featured Offer
						</span>
					</label>
				</div>
			</section>

			{/* SEO */}
			<section className="rounded-2xl border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900">
					SEO Settings
				</h2>

				<div className="mt-5 space-y-5">
					<div>
						<label className={labelClass}>SEO Title</label>

						<input
							maxLength={70}
							value={form.seoTitle}
							onChange={(event) =>
								updateField('seoTitle', event.target.value)
							}
							placeholder="Honey & Ghee Combo Offer | Shalban Food"
							className={inputClass}
						/>

						<p className="mt-1 text-xs text-gray-500">
							{form.seoTitle.length}/70 characters
						</p>
					</div>

					<div>
						<label className={labelClass}>SEO Description</label>

						<textarea
							rows={3}
							maxLength={170}
							value={form.seoDescription}
							onChange={(event) =>
								updateField(
									'seoDescription',
									event.target.value
								)
							}
							placeholder="Discover special honey and ghee combo offers at Shalban Food."
							className={inputClass}
						/>

						<p className="mt-1 text-xs text-gray-500">
							{form.seoDescription.length}/170 characters
						</p>
					</div>

					<div>
						<label className={labelClass}>Keywords</label>

						<input
							value={form.keywords}
							onChange={(event) =>
								updateField('keywords', event.target.value)
							}
							placeholder="combo offer, honey, ghee, Shalban Food"
							className={inputClass}
						/>

						<p className="mt-1 text-xs text-gray-500">
							Separate keywords with commas.
						</p>
					</div>
				</div>
			</section>

			{/* Submit */}
			<div className="sticky bottom-4 z-10 flex justify-end">
				<button
					type="submit"
					disabled={loading || uploading}
					className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-bold text-white shadow-lg hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
					<Save size={18} />

					{loading
						? 'Saving...'
						: uploading
							? 'Uploading...'
							: isEdit
								? 'Update Offer'
								: 'Create Offer'}
				</button>
			</div>
		</form>
	);
}
