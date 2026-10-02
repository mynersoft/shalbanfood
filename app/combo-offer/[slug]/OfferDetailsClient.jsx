'use client';

import { Check, Clock3, PackageCheck, ShoppingCart } from 'lucide-react';

import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import { addToCart } from '@/redux/store/slices/cartSlice';
import OfferCountdown from '@/components/Combo/OfferCountdown';

export default function OfferDetailsClient({ offer }) {
	const dispatch = useDispatch();

	const discount =
		offer.regularPrice > 0
			? Math.round(
					((offer.regularPrice - offer.offerPrice) /
						offer.regularPrice) *
						100
				)
			: 0;

	const handleAddToCart = () => {
		if (offer.stock <= 0) {
			toast.error('Offer is out of stock');
			return;
		}

		dispatch(
			addToCart({
				_id: offer._id,
				type: 'combo',

				name: offer.name,
				slug: offer.slug,

				price: offer.offerPrice,
				regularPrice: offer.regularPrice,

				featureImg: offer.featureImg,

				quantity: 1,
				stock: offer.stock,

				comboItems: offer.items,
			})
		);

		toast.success('Combo added to cart');
	};

	return (
		<div className="flex flex-col p-6 sm:p-10">
			<div className="flex items-center justify-between">
				<span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
					COMBO OFFER
				</span>

				{discount > 0 && (
					<span className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-600">
						SAVE {discount}%
					</span>
				)}
			</div>

			<h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
				{offer.name}
			</h1>

			{offer.shortDescription && (
				<p className="mt-4 text-base leading-7 text-gray-600">
					{offer.shortDescription}
				</p>
			)}

			<div className="mt-6">
				<p className="mb-3 text-sm font-bold text-gray-900">
					Combo Includes
				</p>

				<div className="space-y-3">
					{offer.items?.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
							<div className="flex items-center gap-3">
								<div className="rounded-full bg-green-100 p-2 text-green-700">
									<Check size={16} />
								</div>

								<span className="font-medium">{item.name}</span>
							</div>

							<span className="font-bold">{item.quantity}</span>
						</div>
					))}
				</div>
			</div>

			<div className="mt-8 flex items-end gap-3">
				<span className="text-4xl font-black text-green-700">
					৳{offer.offerPrice}
				</span>

				{offer.regularPrice > offer.offerPrice && (
					<span className="pb-1 text-lg text-gray-400 line-through">
						৳{offer.regularPrice}
					</span>
				)}
			</div>

			<div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4">
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-2 text-sm font-semibold text-green-800">
						<Clock3 size={18} />
						Offer ends in
					</span>

					<OfferCountdown endDate={offer.endDate} />
				</div>
			</div>

			<div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
				<PackageCheck size={18} />
				{offer.stock} combo available
			</div>

			{offer.description && (
				<div className="mt-8 border-t pt-6">
					<h2 className="text-lg font-bold">About this offer</h2>

					<p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
						{offer.description}
					</p>
				</div>
			)}

			<button
				type="button"
				onClick={handleAddToCart}
				disabled={offer.stock <= 0}
				className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-700 px-6 py-4 text-base font-bold text-white transition hover:bg-green-800 disabled:bg-gray-400">
				<ShoppingCart size={21} />

				{offer.stock > 0 ? 'Add Combo to Cart' : 'Out of Stock'}
			</button>
		</div>
	);
}
