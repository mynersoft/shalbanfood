'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Clock3, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import OfferCountdown from './OfferCountdown';
import { addToCart } from '@/redux/store/slices/cartSlice';

export default function OfferCard({ offer }) {
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
		if (!offer.stock || offer.stock <= 0) {
			toast.error('This offer is out of stock');
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
		<article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
			<Link
				href={`/offers/${offer.slug}`}
				className="relative block aspect-square overflow-hidden bg-gray-100">
				<Image
					src={offer.featureImg}
					alt={offer.name}
					fill
					className="object-cover transition duration-500 group-hover:scale-105"
					sizes="(max-width: 768px) 50vw, 25vw"
				/>

				{discount > 0 && (
					<span className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
						-{discount}%
					</span>
				)}

				<span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold shadow">
					COMBO
				</span>
			</Link>

			<div className="p-4">
				<Link href={`/offers/${offer.slug}`}>
					<h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-gray-900 hover:text-green-700">
						{offer.name}
					</h3>
				</Link>

				{offer.shortDescription && (
					<p className="mt-1 line-clamp-2 text-sm text-gray-500">
						{offer.shortDescription}
					</p>
				)}

				<div className="mt-3 space-y-2">
					{offer.items?.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
							<span className="text-gray-700">{item.name}</span>

							<span className="font-semibold text-gray-900">
								{item.quantity}
							</span>
						</div>
					))}
				</div>

				<div className="mt-4 flex items-end gap-2">
					<span className="text-2xl font-bold text-green-700">
						৳{offer.offerPrice}
					</span>

					{offer.regularPrice > offer.offerPrice && (
						<span className="pb-1 text-sm text-gray-400 line-through">
							৳{offer.regularPrice}
						</span>
					)}
				</div>

				<div className="mt-3 flex items-center justify-between text-xs text-gray-500">
					<div className="flex items-center gap-1">
						<PackageCheck size={15} />
						{offer.stock} available
					</div>

					<OfferCountdown endDate={offer.endDate} />
				</div>

				<button
					type="button"
					onClick={handleAddToCart}
					disabled={!offer.stock}
					className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400">
					<ShoppingCart size={18} />
					{offer.stock ? 'Add to Cart' : 'Out of Stock'}
				</button>
			</div>
		</article>
	);
}
