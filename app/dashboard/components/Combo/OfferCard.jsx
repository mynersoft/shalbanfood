'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, PackageCheck } from 'lucide-react';
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
				product: {
					...offer,
					_id: offer._id,
					type: 'combo',
					name: offer.name,
					slug: offer.slug,
					price: offer.offerPrice,
					regularPrice: offer.regularPrice,
					sellPrice: offer.offerPrice,
					featureImg: offer.featureImg,
					stock: offer.stock,
					comboItems: offer.items,
				},
				quantity: 1,
			})
		);

		toast.success('Combo added to cart');
	};

	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-xl">
			<div className="relative h-52 w-full overflow-hidden bg-gray-100">
				<Link
					href={`/offers/${offer.slug}`}
					className="relative block h-full w-full">
					<Image
						src={offer.featureImg}
						alt={offer.name}
						fill
						sizes="(max-width: 768px) 100vw, 320px"
						className="object-cover transition duration-500 group-hover:scale-105"
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
			</div>

			<div className="flex flex-1 flex-col p-5">
				<Link href={`/offers/${offer.slug}`}>
					<h3 className="line-clamp-2 min-h-[48px] text-sm font-bold leading-6 text-gray-900 transition hover:text-green-700">
						{offer.name}
					</h3>
				</Link>

				<div className="mt-4 space-y-2">
					{offer.items?.map((item, index) => (
						<div
							key={item._id || index}
							className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-3  text-sm">
							<span className="truncate pr-3 text-gray-700">
								{item.name}
							</span>

							<span className="font-semibold text-gray-900">
								{item.quantity}
							</span>
						</div>
					))}
				</div>

				<div className="mt-auto pt-5">
					<div className="flex items-end gap-2">
						<span className="text-xl font-extrabold tracking-tight text-green-700">
							৳{offer.offerPrice}
						</span>

						{offer.regularPrice > offer.offerPrice && (
							<span className="pb-1 text-sm text-gray-400 line-through">
								৳{offer.regularPrice}
							</span>
						)}
					</div>

					<div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
						<div className="flex items-center gap-1.5 whitespace-nowrap">
							<PackageCheck
								size={15}
								className="text-green-500"
							/>
							<span>{offer.stock} available</span>
						</div>

						<OfferCountdown endDate={offer.endDate} />
					</div>

					<button
						type="button"
						onClick={handleAddToCart}
						disabled={!offer.stock}
						className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400">
						<ShoppingCart size={18} />
						{offer.stock ? 'Add to Cart' : 'Out of Stock'}
					</button>
				</div>
			</div>
		</article>
	);
}
