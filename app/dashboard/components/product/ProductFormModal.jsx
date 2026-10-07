'use client';

import { useEffect, useState } from 'react';

import {
	X,
	Save,
	Plus,
	Trash2,
	Image as ImageIcon,
	Package,
	Tag,
	Search,
	Layers,
	Loader2,
	Link as LinkIcon,
} from 'lucide-react';

import { useQueryClient } from '@tanstack/react-query';

import { useDispatch } from 'react-redux';

import { addProduct, updateProduct } from '@/redux/store/slices/productSlice';

import { useCategories } from '@/hooks/useCategory';

const MAX_VARIANTS = 4;

const unitLabels = {
	gram: 'গ্রাম',
	kg: 'কেজি',
	milliliter: 'মিলিলিটার',
	litre: 'লিটার',
	piece: 'পিস',
};

const allowedUnits = Object.keys(unitLabels);

/* =========================================================
   DEFAULT VARIANT
========================================================= */

const createVariant = () => ({
	_id: undefined,
	value: '',
	unit: 'gram',
	regularPrice: '',
	sellPrice: '',
	stock: 0,
	soldCount: 0,
	sku: '',
});

/* =========================================================
   DEFAULT FORM
========================================================= */

const createDefaultForm = () => ({
	name: '',
	slug: '',
	category: '',
	subCategory: '',
	brand: '',
	warranty: '',

	shortDescription: '',
	description: '',

	sku: '',

	seoTitle: '',
	seoDescription: '',
	keywords: '',

	canonicalUrl: '',

	image: null,
	existingImage: '',

	isActive: true,
	isFeatured: false,

	variants: [createVariant()],
});

/* =========================================================
   SLUG GENERATOR
========================================================= */

const generateSlug = (text = '') => {
	return text
		.toString()
		.trim()
		.toLowerCase()
		.replace(/[^\w\u0980-\u09FF\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
};

const sanitizeSlugInput = (text = '') => {
	return text
		.toString()
		.toLowerCase()
		.replace(/[^\w\u0980-\u09FF\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
};

/* =========================================================
   ERROR HELPER
========================================================= */

const getApiError = (data, fallback = 'Something went wrong.') => {
	return data?.message || data?.error || fallback;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductFormModal({
	isOpen,
	onClose,
	editingProduct = null,
}) {
	const dispatch = useDispatch();

	const queryClient = useQueryClient();

	const isEdit = Boolean(editingProduct);

	/* =======================================================
       CATEGORIES
    ======================================================= */

	const {
		data: categories = [],
		isLoading: categoriesLoading,
		isError: categoriesError,
	} = useCategories();

	/* =======================================================
       FORM STATE
    ======================================================= */

	const [form, setForm] = useState(createDefaultForm());

	const [preview, setPreview] = useState('');

	const [loading, setLoading] = useState(false);

	const [errors, setErrors] = useState({});

	/* =======================================================
       LOAD EDIT PRODUCT
    ======================================================= */

	useEffect(() => {
		if (!isOpen) return;

		if (editingProduct) {
			const variants =
				Array.isArray(editingProduct.variants) &&
				editingProduct.variants.length > 0
					? editingProduct.variants.map((variant) => ({
							_id: variant._id,

							value: variant.value ?? '',

							unit: allowedUnits.includes(variant.unit)
								? variant.unit
								: 'gram',

							regularPrice: variant.regularPrice ?? '',

							sellPrice: variant.sellPrice ?? '',

							stock: variant.stock ?? 0,

							soldCount: variant.soldCount ?? 0,

							sku: variant.sku || '',
						}))
					: [createVariant()];

			setForm({
				name: editingProduct.name || '',
				slug: editingProduct.slug || '',
				category: editingProduct.category || '',
				subCategory: editingProduct.subCategory || '',
				brand: editingProduct.brand || '',
				warranty: editingProduct.warranty || '',
				shortDescription: editingProduct.shortDescription || '',
				description: editingProduct.description || '',
				sku: editingProduct.sku || '',
				seoTitle: editingProduct.seoTitle || '',
				seoDescription: editingProduct.seoDescription || '',
				keywords: Array.isArray(editingProduct.keywords)
					? editingProduct.keywords.join(', ')
					: '',

				canonicalUrl: editingProduct.canonicalUrl || '',
				image: null,
				existingImage: editingProduct.image || '',
				isActive: editingProduct.isActive !== false,
				isFeatured: Boolean(editingProduct.isFeatured),
				variants,
			});

			setPreview(editingProduct.image || '');
		} else {
			setForm(createDefaultForm());

			setPreview('');
		}

		setErrors({});
	}, [isOpen, editingProduct]);

	/* =======================================================
       CLEANUP PREVIEW URL
    ======================================================= */

	useEffect(() => {
		return () => {
			if (preview && preview.startsWith('blob:')) {
				URL.revokeObjectURL(preview);
			}
		};
	}, [preview]);

	/* =======================================================
       UPDATE FIELD
    ======================================================= */

	const updateField = (field, value) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));

		setErrors((prev) => ({
			...prev,
			[field]: '',
		}));
	};

	/* =======================================================
       NAME CHANGE
    ======================================================= */

	const handleNameChange = (value) => {
		setForm((prev) => ({
			...prev,

			name: value,

			slug: isEdit ? prev.slug : generateSlug(value),

			seoTitle: prev.seoTitle || value,
		}));

		setErrors((prev) => ({
			...prev,
			name: '',
		}));
	};

	/* =======================================================
       IMAGE CHANGE
    ======================================================= */

	const handleImageChange = (event) => {
		const file = event.target.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setErrors((prev) => ({
				...prev,
				image: 'Please select a valid image.',
			}));

			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			setErrors((prev) => ({
				...prev,
				image: 'Image size must be less than 10MB.',
			}));

			return;
		}

		setForm((prev) => ({
			...prev,
			image: file,
		}));

		setErrors((prev) => ({
			...prev,
			image: '',
		}));

		const objectUrl = URL.createObjectURL(file);

		setPreview(objectUrl);
	};

	/* =======================================================
       VARIANT UPDATE
    ======================================================= */

	const updateVariant = (index, field, value) => {
		setForm((prev) => {
			const variants = [...prev.variants];

			variants[index] = {
				...variants[index],
				[field]: value,
			};

			return {
				...prev,
				variants,
			};
		});

		setErrors((prev) => ({
			...prev,
			[`variant_${index}_${field}`]: '',
		}));
	};

	/* =======================================================
       ADD VARIANT
    ======================================================= */

	const addVariant = () => {
		if (form.variants.length >= MAX_VARIANTS) {
			return;
		}

		setForm((prev) => ({
			...prev,

			variants: [...prev.variants, createVariant()],
		}));
	};

	/* =======================================================
       REMOVE VARIANT
    ======================================================= */

	const removeVariant = (index) => {
		if (form.variants.length <= 1) {
			return;
		}

		setForm((prev) => ({
			...prev,

			variants: prev.variants.filter((_, i) => i !== index),
		}));
	};

	/* =======================================================
       VALIDATION
    ======================================================= */

	const validate = () => {
		const newErrors = {};

		const name = form.name.trim();

		const slug = generateSlug(form.slug);
		const category = form.category.trim();

		/* BASIC */

		if (!name) {
			newErrors.name = 'Product name is required.';
		}

		if (!slug) {
			newErrors.slug = 'Slug is required.';
		}

		if (!category) {
			newErrors.category = 'Category is required.';
		}

		/* SEO */

		if (form.seoTitle.length > 70) {
			newErrors.seoTitle = 'SEO title must be 70 characters or less.';
		}

		if (form.seoDescription.length > 160) {
			newErrors.seoDescription =
				'SEO description must be 160 characters or less.';
		}

		/* VARIANTS */

		if (!Array.isArray(form.variants) || form.variants.length < 1) {
			newErrors.variants = 'At least one variant is required.';
		}

		if (form.variants.length > MAX_VARIANTS) {
			newErrors.variants = `Maximum ${MAX_VARIANTS} variants allowed.`;
		}

		const variantKeys = new Set();

		form.variants.forEach((variant, index) => {
			const value = Number(variant.value);

			const regularPrice = Number(variant.regularPrice);

			const sellPrice = Number(variant.sellPrice);

			const stock = Number(variant.stock);

			/* VALUE */

			if (!Number.isFinite(value) || value <= 0) {
				newErrors[`variant_${index}_value`] =
					'Size must be greater than 0.';
			}

			/* UNIT */

			if (!allowedUnits.includes(variant.unit)) {
				newErrors[`variant_${index}_unit`] = 'Invalid unit.';
			}

			/* REGULAR PRICE */

			if (!Number.isFinite(regularPrice) || regularPrice < 0) {
				newErrors[`variant_${index}_regularPrice`] =
					'Invalid regular price.';
			}

			/* SELL PRICE */

			if (!Number.isFinite(sellPrice) || sellPrice < 0) {
				newErrors[`variant_${index}_sellPrice`] = 'Invalid sell price.';
			}

			if (
				Number.isFinite(regularPrice) &&
				Number.isFinite(sellPrice) &&
				sellPrice > regularPrice
			) {
				newErrors[`variant_${index}_sellPrice`] =
					'Sell price cannot be higher than regular price.';
			}

			/* STOCK */

			if (!Number.isFinite(stock) || stock < 0) {
				newErrors[`variant_${index}_stock`] = 'Invalid stock.';
			}

			/* DUPLICATE VARIANT */

			if (value > 0 && allowedUnits.includes(variant.unit)) {
				const key = `${value}-${variant.unit}`;

				if (variantKeys.has(key)) {
					newErrors.variants = 'Duplicate variant size found.';
				}

				variantKeys.add(key);
			}
		});

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	};

	/* =======================================================
       IMAGE RESIZE
    ======================================================= */

	const resizeImage = (file, maxWidth = 1200, quality = 0.85) => {
		return new Promise((resolve, reject) => {
			const img = new Image();

			const reader = new FileReader();

			reader.onload = (event) => {
				img.src = event.target.result;
			};

			reader.onerror = reject;

			img.onerror = () => reject(new Error('Unable to read image.'));

			img.onload = () => {
				const scale = Math.min(1, maxWidth / img.width);

				const width = Math.round(img.width * scale);

				const height = Math.round(img.height * scale);

				const canvas = document.createElement('canvas');

				canvas.width = width;

				canvas.height = height;

				const ctx = canvas.getContext('2d');

				if (!ctx) {
					reject(new Error('Canvas is not supported.'));

					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Image resize failed.'));

							return;
						}

						const cleanName = form.name
							.trim()
							.replace(/[^\w\u0980-\u09FF]+/g, '_')
							.replace(/^_+|_+$/g, '');

						const fileName = `${
							cleanName || 'product'
						}_shalbanfood.jpg`;

						const newFile = new File([blob], fileName, {
							type: 'image/jpeg',
						});

						resolve(newFile);
					},
					'image/jpeg',
					quality
				);
			};

			reader.readAsDataURL(file);
		});
	};

	/* =======================================================
       SUBMIT
    ======================================================= */

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (loading) return;

		if (!validate()) {
			return;
		}

		setLoading(true);

		try {
			const formData = new FormData();

			/* =================================================
               BASIC
            ================================================= */

			formData.append('name', form.name.trim());

			formData.append('slug', generateSlug(form.slug));

			formData.append('category', form.category.trim().toLowerCase());

			formData.append(
				'subCategory',
				form.subCategory.trim().toLowerCase()
			);

			formData.append('brand', form.brand.trim());

			formData.append('warranty', form.warranty.trim());

			/* =================================================
               CONTENT
            ================================================= */

			formData.append('shortDescription', form.shortDescription.trim());

			formData.append('description', form.description.trim());

			/* =================================================
               SKU
            ================================================= */

			formData.append('sku', form.sku.trim().toUpperCase());

			/* =================================================
               SEO
            ================================================= */

			formData.append('seoTitle', form.seoTitle.trim());

			formData.append('seoDescription', form.seoDescription.trim());

			const keywords = form.keywords
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);

			formData.append('keywords', JSON.stringify(keywords));

			/* =================================================
               CANONICAL
            ================================================= */

			formData.append('canonicalUrl', form.canonicalUrl.trim());

			/* =================================================
               VARIANTS
            ================================================= */

			const variants = form.variants.map((variant) => {
				const item = {
					value: Number(variant.value),

					unit: variant.unit,

					regularPrice: Number(variant.regularPrice),

					sellPrice: Number(variant.sellPrice),

					stock: Number(variant.stock || 0),

					sku: variant.sku?.trim().toUpperCase() || '',
				};

				/*
				 * IMPORTANT:
				 * Preserve existing variant _id
				 * during edit.
				 */

				if (variant._id) {
					item._id = variant._id;
				}

				/*
				 * soldCount is intentionally
				 * NOT sent from the form.
				 *
				 * API/model should preserve
				 * existing soldCount.
				 */

				return item;
			});

			formData.append('variants', JSON.stringify(variants));

			/* =================================================
               STATUS
            ================================================= */

			formData.append('isActive', String(Boolean(form.isActive)));

			formData.append('isFeatured', String(Boolean(form.isFeatured)));

			/* =================================================
               EXISTING IMAGE
            ================================================= */

			if (form.existingImage) {
				formData.append('existingImage', form.existingImage);
			}

			/* =================================================
               NEW IMAGE
            ================================================= */

			if (form.image) {
				const resized = await resizeImage(form.image);

				formData.append('image', resized);
			}

			/* =================================================
               API
            ================================================= */

			const url = '/api/products';

			const method = isEdit ? 'PUT' : 'POST';

			if (isEdit) {
				formData.append('_id', editingProduct._id);
			}

			const response = await fetch(url, {
				method,
				body: formData,
			});

			let data = null;

			try {
				data = await response.json();
			} catch {
				data = null;
			}

			if (!response.ok) {
				throw new Error(
					getApiError(
						data,
						isEdit
							? 'Product update failed.'
							: 'Product creation failed.'
					)
				);
			}

			const savedProduct = data?.product;

			if (!savedProduct) {
				throw new Error('Product data was not returned by the server.');
			}

			/* =================================================
               REDUX
            ================================================= */

			if (isEdit) {
				dispatch(updateProduct(savedProduct));
			} else {
				dispatch(addProduct(savedProduct));
			}

			/* =================================================
               REACT QUERY
            ================================================= */

			await queryClient.invalidateQueries({
				queryKey: ['products'],
			});

			/* =================================================
               CLOSE
            ================================================= */

			onClose?.();
		} catch (error) {
			console.error('Product submit error:', error);

			const message = error?.message || 'Something went wrong.';

			setErrors({
				submit: message,
			});
		} finally {
			setLoading(false);
		}
	};

	/* =======================================================
       SEO PREVIEW
    ======================================================= */

	const seoPreviewTitle = form.seoTitle || form.name || 'Product Title';

	const seoPreviewDescription =
		form.seoDescription || form.shortDescription || 'Product description';

	/* =======================================================
       CLOSE
    ======================================================= */

	const handleClose = () => {
		if (loading) return;

		onClose?.();
	};

	/* =======================================================
       MODAL
    ======================================================= */

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-black/70
                p-3
                backdrop-blur-sm
                sm:p-6
            ">
			<div
				className="
                    flex
                    max-h-[95vh]
                    w-full
                    max-w-6xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-800
                    bg-gray-950
                    shadow-2xl
                ">
				{/* =================================================
                    HEADER
                ================================================= */}

				<div
					className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-gray-800
                        px-5
                        py-4
                    ">
					<div>
						<h2
							className="
                                text-lg
                                font-bold
                                text-white
                            ">
							{isEdit ? 'Edit Product' : 'Add Product'}
						</h2>

						<p
							className="
                                mt-1
                                text-xs
                                text-gray-500
                            ">
							Shalban Food Product Management
						</p>
					</div>

					<button
						type="button"
						onClick={handleClose}
						disabled={loading}
						className="
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-gray-800
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        ">
						<X size={20} />
					</button>
				</div>

				{/* =================================================
                    FORM
                ================================================= */}

				<form
					onSubmit={handleSubmit}
					className="
                        overflow-y-auto
                        p-4
                        sm:p-6
                    ">
					{/* =================================================
                        SUBMIT ERROR
                    ================================================= */}

					{errors.submit && (
						<div
							className="
                                mb-4
                                rounded-xl
                                border
                                border-red-900/50
                                bg-red-950/40
                                px-4
                                py-3
                                text-sm
                                text-red-400
                            ">
							{errors.submit}
						</div>
					)}

					{/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

					<section
						className="
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<div
							className="
                                mb-5
                                flex
                                items-center
                                gap-2
                            ">
							<Package size={18} className="text-green-500" />

							<h3
								className="
                                    font-semibold
                                    text-white
                                ">
								Basic Information
							</h3>
						</div>

						<div
							className="
                                grid
                                gap-4
                                md:grid-cols-2
                            ">
							{/* NAME */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Product Name *
								</label>

								<input
									value={form.name}
									onChange={(e) =>
										handleNameChange(e.target.value)
									}
									placeholder="লিচু ফুলের মধু"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								{errors.name && (
									<p className="mt-1 text-xs text-red-400">
										{errors.name}
									</p>
								)}
							</div>

							{/* SLUG */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Slug *
								</label>

								<input
									value={form.slug}
									onChange={(e) =>
										updateField(
											'slug',
											sanitizeSlugInput(e.target.value)
										)
									}
									onBlur={() =>
										updateField(
											'slug',
											generateSlug(form.slug)
										)
									}
									placeholder="lichu-fuler-madhu"
									className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500"
								/>

								{errors.slug && (
									<p className="mt-1 text-xs text-red-400">
										{errors.slug}
									</p>
								)}
							</div>

							{/* CATEGORY */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Category *
								</label>

								<select
									value={form.category}
									onChange={(e) =>
										updateField('category', e.target.value)
									}
									disabled={categoriesLoading}
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                        disabled:opacity-50
                                    ">
									<option value="">
										{categoriesLoading
											? 'Loading categories...'
											: 'Select Category'}
									</option>

									{categories.map((category) => (
										<option
											key={category._id}
											value={
												category.slug ||
												generateSlug(category.name)
											}>
											{category.name}
										</option>
									))}
								</select>

								{categoriesError && (
									<p className="mt-1 text-xs text-red-400">
										Failed to load categories.
									</p>
								)}

								{errors.category && (
									<p className="mt-1 text-xs text-red-400">
										{errors.category}
									</p>
								)}
							</div>

							{/* SUB CATEGORY */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Sub Category
								</label>

								<input
									value={form.subCategory}
									onChange={(e) =>
										updateField(
											'subCategory',
											e.target.value
										)
									}
									placeholder="Natural Honey"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>
							</div>

							{/* BRAND */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Brand
								</label>

								<input
									value={form.brand}
									onChange={(e) =>
										updateField('brand', e.target.value)
									}
									placeholder="Shalban Food"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>
							</div>

							{/* WARRANTY */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Warranty
								</label>

								<input
									value={form.warranty}
									onChange={(e) =>
										updateField('warranty', e.target.value)
									}
									placeholder="No Warranty"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>
							</div>

							{/* PRODUCT SKU */}

							<div>
								<label
									className="
                                        mb-2
                                        block
                                        text-sm
                                        text-gray-300
                                    ">
									Product SKU
								</label>

								<input
									value={form.sku}
									onChange={(e) =>
										updateField(
											'sku',
											e.target.value.toUpperCase()
										)
									}
									placeholder="HONEY-LICHU"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        uppercase
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>
							</div>
						</div>
					</section>

					{/* =================================================
                        IMAGE
                    ================================================= */}

					<section
						className="
                            mt-4
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<div
							className="
                                mb-4
                                flex
                                items-center
                                gap-2
                            ">
							<ImageIcon size={18} className="text-green-500" />

							<h3 className="font-semibold text-white">
								Product Image
							</h3>
						</div>

						<div
							className="
                                grid
                                gap-5
                                md:grid-cols-[180px_1fr]
                            ">
							<div
								className="
                                    flex
                                    h-44
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-dashed
                                    border-gray-700
                                    bg-gray-950
                                ">
								{preview ? (
									<img
										src={preview}
										alt={form.name || 'Product preview'}
										className="
                                            h-full
                                            w-full
                                            object-cover
                                        "
									/>
								) : (
									<ImageIcon
										size={40}
										className="text-gray-700"
									/>
								)}
							</div>

							<div>
								<label
									className="
                                        flex
                                        cursor-pointer
                                        flex-col
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-gray-700
                                        bg-gray-950
                                        p-8
                                        text-center
                                        transition
                                        hover:border-green-500
                                    ">
									<ImageIcon
										size={30}
										className="mb-2 text-gray-500"
									/>

									<span className="text-sm text-gray-300">
										Choose Product Image
									</span>

									<span className="mt-1 text-xs text-gray-600">
										JPG / PNG / WEBP · Max 10MB
									</span>

									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={handleImageChange}
										className="hidden"
									/>
								</label>

								{errors.image && (
									<p className="mt-2 text-xs text-red-400">
										{errors.image}
									</p>
								)}
							</div>
						</div>
					</section>

					{/* =================================================
                        VARIANTS
                    ================================================= */}

					<section
						className="
                            mt-4
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<div
							className="
                                mb-5
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-3
                            ">
							<div
								className="
                                    flex
                                    items-center
                                    gap-2
                                ">
								<Layers size={18} className="text-green-500" />

								<div>
									<h3 className="font-semibold text-white">
										Product Variants
									</h3>

									<p className="mt-1 text-xs text-gray-500">
										Maximum 4 variants
									</p>
								</div>
							</div>

							{form.variants.length < MAX_VARIANTS && (
								<button
									type="button"
									onClick={addVariant}
									className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        bg-green-600
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        hover:bg-green-700
                                    ">
									<Plus size={16} />
									Add Variant
								</button>
							)}
						</div>

						{errors.variants && (
							<p className="mb-3 text-sm text-red-400">
								{errors.variants}
							</p>
						)}

						<div className="space-y-4">
							{form.variants.map((variant, index) => (
								<div
									key={variant._id || `variant-${index}`}
									className="
                                            rounded-xl
                                            border
                                            border-gray-800
                                            bg-gray-950
                                            p-4
                                        ">
									<div
										className="
                                                mb-4
                                                flex
                                                items-center
                                                justify-between
                                            ">
										<span
											className="
                                                    text-sm
                                                    font-semibold
                                                    text-green-400
                                                ">
											Variant #{index + 1}
										</span>

										{form.variants.length > 1 && (
											<button
												type="button"
												onClick={() =>
													removeVariant(index)
												}
												className="
                                                        rounded-lg
                                                        p-2
                                                        text-red-400
                                                        transition
                                                        hover:bg-red-500/10
                                                    ">
												<Trash2 size={16} />
											</button>
										)}
									</div>

									<div
										className="
                                                grid
                                                gap-3
                                                sm:grid-cols-2
                                                lg:grid-cols-3
                                                xl:grid-cols-6
                                            ">
										{/* SIZE */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Size *
											</label>

											<input
												type="number"
												min="0"
												step="any"
												value={variant.value}
												onChange={(e) =>
													updateVariant(
														index,
														'value',
														e.target.value
													)
												}
												placeholder="500"
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    "
											/>

											{errors[
												`variant_${index}_value`
											] && (
												<p className="mt-1 text-xs text-red-400">
													{
														errors[
															`variant_${index}_value`
														]
													}
												</p>
											)}
										</div>

										{/* UNIT */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Unit *
											</label>

											<select
												value={variant.unit}
												onChange={(e) =>
													updateVariant(
														index,
														'unit',
														e.target.value
													)
												}
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    ">
												{Object.entries(unitLabels).map(
													([value, label]) => (
														<option
															key={value}
															value={value}>
															{label}
														</option>
													)
												)}
											</select>
										</div>

										{/* REGULAR PRICE */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Regular Price *
											</label>

											<input
												type="number"
												min="0"
												step="any"
												value={variant.regularPrice}
												onChange={(e) =>
													updateVariant(
														index,
														'regularPrice',
														e.target.value
													)
												}
												placeholder="700"
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    "
											/>

											{errors[
												`variant_${index}_regularPrice`
											] && (
												<p className="mt-1 text-xs text-red-400">
													{
														errors[
															`variant_${index}_regularPrice`
														]
													}
												</p>
											)}
										</div>

										{/* SELL PRICE */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Sell Price *
											</label>

											<input
												type="number"
												min="0"
												step="any"
												value={variant.sellPrice}
												onChange={(e) =>
													updateVariant(
														index,
														'sellPrice',
														e.target.value
													)
												}
												placeholder="600"
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    "
											/>

											{errors[
												`variant_${index}_sellPrice`
											] && (
												<p className="mt-1 text-xs text-red-400">
													{
														errors[
															`variant_${index}_sellPrice`
														]
													}
												</p>
											)}
										</div>

										{/* STOCK */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Stock *
											</label>

											<input
												type="number"
												min="0"
												step="1"
												value={variant.stock}
												onChange={(e) =>
													updateVariant(
														index,
														'stock',
														e.target.value
													)
												}
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    "
											/>

											{errors[
												`variant_${index}_stock`
											] && (
												<p className="mt-1 text-xs text-red-400">
													{
														errors[
															`variant_${index}_stock`
														]
													}
												</p>
											)}
										</div>

										{/* VARIANT SKU */}

										<div>
											<label className="mb-1 block text-xs text-gray-500">
												Variant SKU
											</label>

											<input
												value={variant.sku}
												onChange={(e) =>
													updateVariant(
														index,
														'sku',
														e.target.value.toUpperCase()
													)
												}
												placeholder="HONEY-500"
												className="
                                                        w-full
                                                        rounded-lg
                                                        border
                                                        border-gray-700
                                                        bg-gray-900
                                                        px-3
                                                        py-2
                                                        text-sm
                                                        uppercase
                                                        text-white
                                                        outline-none
                                                        focus:border-green-500
                                                    "
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* =================================================
                        CONTENT
                    ================================================= */}

					<section
						className="
                            mt-4
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<div
							className="
                                mb-4
                                flex
                                items-center
                                gap-2
                            ">
							<Tag size={18} className="text-green-500" />

							<h3 className="font-semibold text-white">
								Product Content
							</h3>
						</div>

						<div className="space-y-4">
							{/* SHORT DESCRIPTION */}

							<div>
								<label className="mb-2 block text-sm text-gray-300">
									Short Description
								</label>

								<textarea
									rows={3}
									maxLength={500}
									value={form.shortDescription}
									onChange={(e) =>
										updateField(
											'shortDescription',
											e.target.value
										)
									}
									placeholder="শালবন ফুডের প্রাকৃতিক লিচু ফুলের মধু..."
									className="
                                        w-full
                                        resize-none
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								<div className="mt-1 text-right text-xs text-gray-600">
									{form.shortDescription.length}
									/500
								</div>
							</div>

							{/* DESCRIPTION */}

							<div>
								<label className="mb-2 block text-sm text-gray-300">
									Full Description
								</label>

								<textarea
									rows={8}
									value={form.description}
									onChange={(e) =>
										updateField(
											'description',
											e.target.value
										)
									}
									placeholder="Product details..."
									className="
                                        w-full
                                        resize-y
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>
							</div>
						</div>
					</section>

					{/* =================================================
                        SEO
                    ================================================= */}

					<section
						className="
                            mt-4
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<div
							className="
                                mb-5
                                flex
                                items-center
                                gap-2
                            ">
							<Search size={18} className="text-green-500" />

							<h3 className="font-semibold text-white">
								SEO Settings
							</h3>
						</div>

						<div className="space-y-4">
							{/* SEO TITLE */}

							<div>
								<label className="mb-2 block text-sm text-gray-300">
									SEO Title
								</label>

								<input
									value={form.seoTitle}
									maxLength={70}
									onChange={(e) =>
										updateField('seoTitle', e.target.value)
									}
									placeholder="লিচু ফুলের মধু | Shalban Food"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								<div className="mt-1 flex justify-between text-xs">
									<span className="text-gray-600">
										Recommended concise title
									</span>

									<span
										className={
											form.seoTitle.length > 60
												? 'text-yellow-500'
												: 'text-gray-600'
										}>
										{form.seoTitle.length}
										/70
									</span>
								</div>

								{errors.seoTitle && (
									<p className="mt-1 text-xs text-red-400">
										{errors.seoTitle}
									</p>
								)}
							</div>

							{/* SEO DESCRIPTION */}

							<div>
								<label className="mb-2 block text-sm text-gray-300">
									SEO Description
								</label>

								<textarea
									rows={3}
									maxLength={160}
									value={form.seoDescription}
									onChange={(e) =>
										updateField(
											'seoDescription',
											e.target.value
										)
									}
									placeholder="শালবন ফুডের খাঁটি লিচু ফুলের মধু..."
									className="
                                        w-full
                                        resize-none
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								<div className="mt-1 text-right text-xs text-gray-600">
									{form.seoDescription.length}
									/160
								</div>

								{errors.seoDescription && (
									<p className="mt-1 text-xs text-red-400">
										{errors.seoDescription}
									</p>
								)}
							</div>

							{/* KEYWORDS */}

							<div>
								<label className="mb-2 block text-sm text-gray-300">
									Keywords
								</label>

								<input
									value={form.keywords}
									onChange={(e) =>
										updateField('keywords', e.target.value)
									}
									placeholder="লিচু ফুলের মধু, খাঁটি মধু, honey, Shalban Food"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								<p className="mt-1 text-xs text-gray-600">
									Separate keywords with commas.
								</p>
							</div>

							{/* CANONICAL URL */}

							<div>
								<label className="mb-2 flex items-center gap-2 text-sm text-gray-300">
									<LinkIcon size={15} />
									Canonical URL
								</label>

								<input
									type="url"
									value={form.canonicalUrl}
									onChange={(e) =>
										updateField(
											'canonicalUrl',
											e.target.value
										)
									}
									placeholder="https://shalbanfood.com/product/lichu-fuler-madhu"
									className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-700
                                        bg-gray-950
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-green-500
                                    "
								/>

								<p className="mt-1 text-xs text-gray-600">
									Leave empty to use the default product URL.
								</p>
							</div>
						</div>

						{/* SEO PREVIEW */}

						<div
							className="
                                mt-5
                                rounded-xl
                                border
                                border-gray-800
                                bg-gray-950
                                p-4
                            ">
							<p className="mb-2 text-xs text-gray-600">
								Search Preview
							</p>

							<h4 className="text-lg text-blue-400">
								{seoPreviewTitle}
							</h4>

							<p className="mt-1 break-all text-xs text-green-500">
								shalbanfood.vercel.app/product/
								{form.slug || 'product-slug'}
							</p>

							<p className="mt-1 text-sm text-gray-400">
								{seoPreviewDescription}
							</p>
						</div>
					</section>

					{/* =================================================
                        STATUS
                    ================================================= */}

					<section
						className="
                            mt-4
                            flex
                            flex-wrap
                            gap-6
                            rounded-xl
                            border
                            border-gray-800
                            bg-gray-900/60
                            p-4
                        ">
						<label className="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								checked={form.isActive}
								onChange={(e) =>
									updateField('isActive', e.target.checked)
								}
								className="h-4 w-4 accent-green-600"
							/>

							<span className="text-sm text-gray-300">
								Active Product
							</span>
						</label>

						<label className="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								checked={form.isFeatured}
								onChange={(e) =>
									updateField('isFeatured', e.target.checked)
								}
								className="h-4 w-4 accent-green-600"
							/>

							<span className="text-sm text-gray-300">
								Featured Product
							</span>
						</label>
					</section>

					{/* =================================================
                        FOOTER
                    ================================================= */}

					<div
						className="
                            sticky
                            bottom-0
                            mt-5
                            flex
                            justify-end
                            gap-3
                            border-t
                            border-gray-800
                            bg-gray-950
                            pt-4
                        ">
						<button
							type="button"
							onClick={handleClose}
							disabled={loading}
							className="
                                rounded-lg
                                border
                                border-gray-700
                                px-5
                                py-2.5
                                text-sm
                                text-gray-300
                                transition
                                hover:bg-gray-800
                                disabled:opacity-50
                            ">
							Cancel
						</button>

						<button
							type="submit"
							disabled={loading}
							className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-green-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-green-700
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            ">
							{loading ? (
								<>
									<Loader2
										size={17}
										className="animate-spin"
									/>
									Saving...
								</>
							) : (
								<>
									<Save size={17} />

									{isEdit ? 'Update Product' : 'Save Product'}
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
