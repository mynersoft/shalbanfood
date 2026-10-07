'use client';

import { useMemo, useState } from 'react';

import { Minus, Plus, ShoppingCart } from 'lucide-react';

import toast from 'react-hot-toast';

/* =========================================================
   CART HOOK-UP
   Connect this to your real cart (Redux slice, localStorage,
   API call...). Right now it only receives the item.
========================================================= */

const addItemToCart = (item) => {
	// TODO: dispatch(addToCart(item)) or save to your cart store
	console.log('Add to cart:', item);
};

export default function ProductPurchase({
	productId,
	name,
	slug,
	image,
	variants,
}) {
	/* Default: first in-stock variant, otherwise the first one */

	const [selectedId, setSelectedId] = useState(() => {
		const firstAvailable = variants.find((v) => v.stock > 0);

		return (firstAvailable || variants[0])?._id;
	});

	const [quantity, setQuantity] = useState(1);

	const selected = useMemo(
		() => variants.find((v) => v._id === selectedId) || variants[0],
		[variants, selectedId]
	);

	if (!selected) {
		return null;
	}

	const inStock = selected.stock > 0;

	const maxQuantity = Math.max(1, Math.min(selected.stock, 20));

	const hasDiscount = selected.regularPrice > selected.sellPrice;

	const discountPercent = hasDiscount
		? Math.round(
				((selected.regularPrice - selected.sellPrice) /
					selected.regularPrice) *
					100
			)
		: 0;

	const handleSelectVariant = (variant) => {
		setSelectedId(variant._id);

		setQuantity(1);
	};

	const handleAddToCart = () => {
		if (!inStock) return;

		addItemToCart({
			productId,
			variantId: selected._id,
			name,
			slug,
			image,
			size: selected.label,
			sku: selected.sku,
			price: selected.sellPrice,
			quantity,
		});

		toast.success(`${name} (${selected.label}) added to cart`);
	};

	return (
		<div>
			{/* PRICE */}

			<div className="mt-5 flex flex-wrap items-baseline gap-3">
				<span className="text-3xl font-bold text-green-600">
					৳{selected.sellPrice}
				</span>

				{hasDiscount && (
					<>
						<span className="text-lg text-gray-400 line-through">
							৳{selected.regularPrice}
						</span>

						<span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
							{discountPercent}% OFF
						</span>
					</>
				)}
			</div>

			{/* VARIANTS */}

			<div className="mt-6">
				<h2 className="mb-3 text-sm font-semibold text-gray-900">
					পরিমাণ বেছে নিন
				</h2>

				<div className="flex flex-wrap gap-2" role="group">
					{variants.map((variant) => {
						const isSelected = variant._id === selected._id;

						const soldOut = variant.stock <= 0;

						return (
							<button
								key={variant._id}
								type="button"
								aria-pressed={isSelected}
								onClick={() => handleSelectVariant(variant)}
								className={`rounded-lg border px-4 py-3 text-left transition ${
									isSelected
										? 'border-green-600 bg-green-50 ring-1 ring-green-600'
										: 'border-gray-200 hover:border-green-400'
								} ${soldOut ? 'opacity-60' : ''}`}>
								<span className="block font-semibold text-gray-900">
									{variant.label}
								</span>

								<span className="mt-1 block text-sm font-medium text-green-600">
									৳{variant.sellPrice}
								</span>

								<span
									className={`mt-1 block text-xs ${
										soldOut
											? 'text-red-500'
											: 'text-gray-500'
									}`}>
									{soldOut ? 'Out of Stock' : 'In Stock'}
								</span>
							</button>
						);
					})}
				</div>

				{inStock && selected.stock <= 5 && (
					<p className="mt-3 text-sm font-medium text-orange-600">
						মাত্র {selected.stock}টি বাকি আছে
					</p>
				)}
			</div>

			{/* QUANTITY */}

			{inStock && (
				<div className="mt-6 flex items-center gap-4">
					<span className="text-sm font-semibold text-gray-900">
						Quantity
					</span>

					<div className="flex items-center rounded-lg border border-gray-200">
						<button
							type="button"
							aria-label="Decrease quantity"
							onClick={() =>
								setQuantity((q) => Math.max(1, q - 1))
							}
							disabled={quantity <= 1}
							className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
							<Minus size={16} />
						</button>

						<span className="min-w-10 text-center text-sm font-semibold">
							{quantity}
						</span>

						<button
							type="button"
							aria-label="Increase quantity"
							onClick={() =>
								setQuantity((q) => Math.min(maxQuantity, q + 1))
							}
							disabled={quantity >= maxQuantity}
							className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
							<Plus size={16} />
						</button>
					</div>
				</div>
			)}

			{/* CTA */}

			<button
				type="button"
				onClick={handleAddToCart}
				disabled={!inStock}
				className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300">
				<ShoppingCart size={20} />

				{inStock ? 'Add to Cart' : 'Out of Stock'}
			</button>
		</div>
	);
}
