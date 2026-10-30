'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import {
	useCreateComboOffer,
	useUpdateComboOffer,
} from '@/hooks/useComboOffers';

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

function slugify(value) {
	return value
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
	'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

const labelClass = 'mb-2 block text-sm font-semibold text-slate-300';

export default function OfferForm({ offer = null }) {
	const router = useRouter();
	const isEdit = Boolean(offer);

	const createMutation = useCreateComboOffer();
	const updateMutation = useUpdateComboOffer();

	const [form, setForm] = useState(createDefaultForm);
	const [uploading, setUploading] = useState(false);

	const saving = createMutation.isPending || updateMutation.isPending;

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
			slug: previous.slug || slugify(value),
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
			toast.error('কমপক্ষে ২টি Item রাখতে হবে।');
			return;
		}

		setForm((previous) => ({
			...previous,
			items: previous.items.filter((_, itemIndex) => itemIndex !== index),
		}));
	};

	// Feature image upload
	const uploadImage = async (file) => {
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('সঠিক Image নির্বাচন করুন।');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image size সর্বোচ্চ 5 MB হতে পারবে।');
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
			toast.error(error.message);
		} finally {
			setUploading(false);
		}
	};

	// Form validation
	const validate = () => {
		if (!form.name.trim()) {
			toast.error('Offer name প্রয়োজন।');
			return false;
		}

		if (!form.slug.trim()) {
			toast.error('Slug প্রয়োজন।');
			return false;
		}

		if (
			form.items.length < 2 ||
			form.items.some(
				(item) => !item.name.trim() || !String(item.quantity).trim()
			)
		) {
			toast.error('সব Combo Item পূরণ করুন।');
			return false;
		}

		const regularPrice = Number(form.regularPrice);
		const offerPrice = Number(form.offerPrice);
		const stock = Number(form.stock);
		const priority = Number(form.priority);

		if (
			form.regularPrice === '' ||
			!Number.isFinite(regularPrice) ||
			regularPrice < 1
		) {
			toast.error('সঠিক Regular Price দিন।');
			return false;
		}

		if (
			form.offerPrice === '' ||
			!Number.isFinite(offerPrice) ||
			offerPrice < 0
		) {
			toast.error('সঠিক Offer Price দিন।');
			return false;
		}

		if (offerPrice > regularPrice) {
			toast.error(
				'Offer Price, Regular Price-এর চেয়ে বেশি হতে পারবে না।'
			);
			return false;
		}

		if (!Number.isInteger(stock) || stock < 0) {
			toast.error('সঠিক Stock দিন।');
			return false;
		}

		if (!Number.isInteger(priority)) {
			toast.error('সঠিক Priority দিন।');
			return false;
		}

		if (!form.featureImg.trim()) {
			toast.error('Feature Image প্রয়োজন।');
			return false;
		}

		if (!form.startDate || !form.endDate) {
			toast.error('Start এবং End Date প্রয়োজন।');
			return false;
		}

		const start = new Date(form.startDate);
		const end = new Date(form.endDate);

		if (
			Number.isNaN(start.getTime()) ||
			Number.isNaN(end.getTime()) ||
			end <= start
		) {
			toast.error('End Date অবশ্যই Start Date-এর পরে হতে হবে।');
			return false;
		}

		return true;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (saving || uploading) return;
		if (!validate()) return;

		const payload = {
			name: form.name.trim(),
			slug: form.slug.trim().toLowerCase(),

			shortDescription: form.shortDescription.trim(),
			description: form.description.trim(),

			items: form.items.map((item) => ({
				name: item.name.trim(),
				quantity: String(item.quantity).trim(),
			})),

			regularPrice: Number(form.regularPrice),
			offerPrice: Number(form.offerPrice),

			featureImg: form.featureImg.trim(),
			images: form.images,

			stock: Number(form.stock),

			startDate: new Date(form.startDate).toISOString(),
			endDate: new Date(form.endDate).toISOString(),

			// Explicit Boolean values
			isActive: form.isActive === true,
			isFeatured: form.isFeatured === true,

			priority: Number(form.priority),

			seoTitle: form.seoTitle.trim(),
			seoDescription: form.seoDescription.trim(),

			keywords: form.keywords
				.split(',')
				.map((keyword) => keyword.trim())
				.filter(Boolean),
		};

		try {
			if (isEdit) {
				const id = offer._id || offer.id;

				if (!id) {
					throw new Error('Offer ID পাওয়া যায়নি।');
				}

				await updateMutation.mutateAsync({
					id,
					payload,
				});

				toast.success('Offer updated successfully');
			} else {
				await createMutation.mutateAsync(payload);

				toast.success('Offer created successfully');
			}

			router.push('/dashboard/combo');
			router.refresh();
		} catch (error) {
			console.error('SAVE OFFER ERROR:', error);
			toast.error(error.message || 'Failed to save offer');
		}
	};

	const regularPrice = Number(form.regularPrice);
	const offerPrice = Number(form.offerPrice);

	const discount =
		regularPrice > 0 && offerPrice >= 0 && offerPrice <= regularPrice
			? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
			: 0;

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 rounded-2xl bg-slate-950 p-3 text-slate-100 md:p-5">
			{/* Basic information */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<h2 className="text-lg font-bold">Basic Information</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-2">
					<div className="md:col-span-2">
						<label className={labelClass}>Offer Name *</label>
						<input
							required
							value={form.name}
							onChange={(e) => handleNameChange(e.target.value)}
							placeholder="কালোজিরা মধু + গাওয়া ঘি কম্বো"
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Slug *</label>
						<input
							required
							value={form.slug}
							onChange={(e) =>
								updateField('slug', e.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div>
						<label className={labelClass}>Priority</label>
						<input
							type="number"
							step="1"
							value={form.priority}
							onChange={(e) =>
								updateField('priority', e.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div className="md:col-span-2">
						<label className={labelClass}>Short Description</label>
						<input
							maxLength={300}
							value={form.shortDescription}
							onChange={(e) =>
								updateField('shortDescription', e.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div className="md:col-span-2">
						<label className={labelClass}>Description</label>
						<textarea
							rows={5}
							value={form.description}
							onChange={(e) =>
								updateField('description', e.target.value)
							}
							className={inputClass}
						/>
					</div>
				</div>
			</section>

			{/* Combo items */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-lg font-bold">Combo Items</h2>

					<button
						type="button"
						onClick={addItem}
						className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white">
						<Plus size={17} />
						Add Item
					</button>
				</div>

				<div className="mt-5 space-y-3">
					{form.items.map((item, index) => (
						<div
							key={index}
							className="grid gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3 md:grid-cols-[1fr_180px_auto]">
							<input
								value={item.name}
								onChange={(e) =>
									updateItem(index, 'name', e.target.value)
								}
								placeholder="Product name"
								className={inputClass}
								required
							/>

							<input
								value={item.quantity}
								onChange={(e) =>
									updateItem(
										index,
										'quantity',
										e.target.value
									)
								}
								placeholder="500 গ্রাম"
								className={inputClass}
								required
							/>

							<button
								type="button"
								onClick={() => removeItem(index)}
								className="flex items-center justify-center rounded-xl border border-red-800 px-4 text-red-400">
								<Trash2 size={18} />
							</button>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<h2 className="text-lg font-bold">Pricing</h2>

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
							onChange={(e) =>
								updateField('regularPrice', e.target.value)
							}
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
							onChange={(e) =>
								updateField('offerPrice', e.target.value)
							}
							className={inputClass}
						/>
					</div>

					<div className="flex items-end">
						<div className="w-full rounded-xl border border-emerald-800 bg-emerald-950/40 p-4">
							<p className="text-sm text-emerald-300">Discount</p>
							<p className="text-2xl font-bold text-emerald-300">
								{discount}%
							</p>
							{regularPrice > 0 && offerPrice <= regularPrice && (
								<p className="text-sm text-emerald-300">
									সাশ্রয়: ৳
									{(regularPrice - offerPrice).toLocaleString(
										'en-US'
									)}
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Feature image */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<h2 className="text-lg font-bold">Feature Image</h2>

				<div className="mt-5">
					{form.featureImg ? (
						<div className="relative max-w-md overflow-hidden rounded-2xl border border-slate-700">
							<img
								src={form.featureImg}
								alt={`${form.name || 'Offer'} feature`}
								className="aspect-square w-full object-cover"
							/>

							<button
								type="button"
								onClick={() => updateField('featureImg', '')}
								className="absolute right-3 top-3 rounded-full bg-slate-900/80 p-2 text-red-400">
								<X size={18} />
							</button>
						</div>
					) : (
						<label className="flex aspect-video max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950">
							<ImagePlus size={40} className="text-slate-400" />
							<span className="mt-3 text-sm font-semibold">
								{uploading
									? 'Uploading...'
									: 'Choose Feature Image'}
							</span>
							<span className="mt-1 text-xs text-slate-400">
								Maximum 5 MB
							</span>

							<input
								type="file"
								accept="image/*"
								className="hidden"
								disabled={uploading || saving}
								onChange={(e) => {
									const file = e.target.files?.[0];
									void uploadImage(file);
									e.target.value = '';
								}}
							/>
						</label>
					)}
				</div>
			</section>

			{/* Stock and schedule */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<h2 className="text-lg font-bold">Stock & Schedule</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-3">
					<div>
						<label className={labelClass}>Stock</label>
						<input
							type="number"
							min="0"
							step="1"
							value={form.stock}
							onChange={(e) =>
								updateField('stock', e.target.value)
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
							onChange={(e) =>
								updateField('startDate', e.target.value)
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
							onChange={(e) =>
								updateField('endDate', e.target.value)
							}
							className={inputClass}
						/>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap gap-6">
					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(e) =>
								updateField('isActive', e.target.checked)
							}
							className="h-5 w-5 accent-green-700"
						/>
						<span className="text-sm font-semibold">
							Active Offer
						</span>
					</label>

					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={form.isFeatured}
							onChange={(e) =>
								updateField('isFeatured', e.target.checked)
							}
							className="h-5 w-5 accent-green-700"
						/>
						<span className="text-sm font-semibold">
							Featured Offer
						</span>
					</label>
				</div>

				<p className="mt-4 text-xs text-slate-400">
					Active বন্ধ করলে অফারটি Inactive হবে। আবার চালু করলে Active
					হবে।
				</p>
			</section>

			{/* SEO */}
			<section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
				<h2 className="text-lg font-bold">SEO Settings</h2>

				<div className="mt-5 space-y-5">
					<div>
						<label className={labelClass}>SEO Title</label>
						<input
							maxLength={70}
							value={form.seoTitle}
							onChange={(e) =>
								updateField('seoTitle', e.target.value)
							}
							className={inputClass}
						/>
						<p className="mt-1 text-xs text-slate-400">
							{form.seoTitle.length}/70 characters
						</p>
					</div>

					<div>
						<label className={labelClass}>SEO Description</label>
						<textarea
							rows={3}
							maxLength={170}
							value={form.seoDescription}
							onChange={(e) =>
								updateField('seoDescription', e.target.value)
							}
							className={inputClass}
						/>
						<p className="mt-1 text-xs text-slate-400">
							{form.seoDescription.length}/170 characters
						</p>
					</div>

					<div>
						<label className={labelClass}>Keywords</label>
						<input
							value={form.keywords}
							onChange={(e) =>
								updateField('keywords', e.target.value)
							}
							placeholder="honey, ghee, combo offer"
							className={inputClass}
						/>
						<p className="mt-1 text-xs text-slate-400">
							কমা দিয়ে আলাদা করুন।
						</p>
					</div>
				</div>
			</section>

			{/* Submit */}
			<div className="sticky bottom-4 z-10 flex justify-end">
				<button
					type="submit"
					disabled={saving || uploading}
					className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 font-bold text-white shadow-lg hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
					<Save size={18} />
					{uploading
						? 'Uploading...'
						: saving
							? 'Saving...'
							: isEdit
								? 'Update Offer'
								: 'Create Offer'}
				</button>
			</div>
		</form>
	);
}
