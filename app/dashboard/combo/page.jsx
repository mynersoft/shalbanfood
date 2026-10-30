'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	Plus,
	Search,
	RefreshCw,
	Eye,
	Pencil,
	Trash2,
	Package,
	Tag,
	CalendarDays,
	Star,
	AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

function getOfferStatus(offer) {
	const now = Date.now();
	const start = new Date(offer.startDate).getTime();
	const end = new Date(offer.endDate).getTime();

	if (!offer.isActive) return 'inactive';
	if (Number(offer.stock) <= 0) return 'out_of_stock';
	if (now < start) return 'upcoming';
	if (now > end) return 'expired';

	return 'active';
}

const STATUS_LABELS = {
	active: 'Active',
	inactive: 'Inactive',
	upcoming: 'Upcoming',
	expired: 'Expired',
	out_of_stock: 'Out of stock',
};

const STATUS_STYLES = {
	active: 'bg-green-100 text-green-700',
	inactive: 'bg-gray-100 text-gray-600',
	upcoming: 'bg-blue-100 text-blue-700',
	expired: 'bg-red-100 text-red-700',
	out_of_stock: 'bg-orange-100 text-orange-700',
};

function formatDate(value) {
	if (!value) return '—';

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return '—';

	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

function money(value) {
	return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

export default function ComboOfferListPage() {
	const router = useRouter();

	const [offers, setOffers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState(null);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [featuredOnly, setFeaturedOnly] = useState(false);

	const fetchOffers = useCallback(async () => {
		setLoading(true);

		try {
			const response = await fetch('/api/combooffer?admin=true', {
				method: 'GET',
				cache: 'no-store',
				headers: {
					Accept: 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to load offers');
			}

			setOffers(Array.isArray(data.offers) ? data.offers : []);
		} catch (error) {
			console.error('FETCH OFFERS ERROR:', error);
			toast.error(error.message || 'Could not load offers');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchOffers();
	}, [fetchOffers]);

	const filteredOffers = useMemo(() => {
		const query = search.trim().toLowerCase();

		return offers.filter((offer) => {
			const matchesSearch =
				!query ||
				[
					offer.name,
					offer.slug,
					offer.shortDescription,
					...(offer.items || []).map((item) => item.name),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(query);

			const matchesStatus =
				statusFilter === 'all' ||
				getOfferStatus(offer) === statusFilter;

			const matchesFeatured = !featuredOnly || offer.isFeatured;

			return matchesSearch && matchesStatus && matchesFeatured;
		});
	}, [offers, search, statusFilter, featuredOnly]);

	const stats = useMemo(() => {
		const result = {
			total: offers.length,
			active: 0,
			upcoming: 0,
			expired: 0,
		};

		offers.forEach((offer) => {
			const status = getOfferStatus(offer);

			if (status === 'active') result.active += 1;
			if (status === 'upcoming') result.upcoming += 1;
			if (status === 'expired') result.expired += 1;
		});

		return result;
	}, [offers]);

	const handleDelete = async (offer) => {
		const confirmed = window.confirm(
			`Delete "${offer.name}"?\nThis action cannot be undone.`
		);

		if (!confirmed) return;

		setDeletingId(String(offer._id));

		try {
			const response = await fetch(`/api/offers/${offer._id}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Failed to delete offer');
			}

			setOffers((previous) =>
				previous.filter(
					(item) => String(item._id) !== String(offer._id)
				)
			);

			toast.success('Combo offer deleted successfully');
		} catch (error) {
			console.error('DELETE OFFER ERROR:', error);
			toast.error(error.message || 'Delete failed');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<main className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6 lg:p-8">
			{/* Header */}
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<div className="flex items-center gap-2">
						<Package size={25} className="text-green-700" />
						<h1 className="text-2xl font-bold text-gray-900">
							Combo Offers
						</h1>
					</div>

					<p className="mt-1 text-sm text-gray-500">
						Manage your Shalban Food combo offers.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={fetchOffers}
						disabled={loading}
						className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60">
						<RefreshCw
							size={17}
							className={loading ? 'animate-spin' : ''}
						/>
						Refresh
					</button>

					<Link
						href="/dashboard/combo/create"
						className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800">
						<Plus size={18} />
						Create Offer
					</Link>
				</div>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{[
					{
						label: 'Total Offers',
						value: stats.total,
						icon: Package,
						color: 'text-gray-700',
					},
					{
						label: 'Active Now',
						value: stats.active,
						icon: Tag,
						color: 'text-green-700',
					},
					{
						label: 'Upcoming',
						value: stats.upcoming,
						icon: CalendarDays,
						color: 'text-blue-700',
					},
					{
						label: 'Expired',
						value: stats.expired,
						icon: AlertCircle,
						color: 'text-red-700',
					},
				].map((stat) => {
					const Icon = stat.icon;

					return (
						<div
							key={stat.label}
							className="rounded-2xl border bg-white p-5 shadow-sm">
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm text-gray-500">
									{stat.label}
								</p>
								<Icon size={20} className={stat.color} />
							</div>

							<p className="mt-3 text-3xl font-bold text-gray-900">
								{stat.value}
							</p>
						</div>
					);
				})}
			</div>

			{/* Search and filters */}
			<section className="rounded-2xl border bg-white p-4 shadow-sm">
				<div className="flex flex-col gap-3 lg:flex-row">
					<div className="relative flex-1">
						<Search
							size={19}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>

						<input
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search offer, slug or product..."
							className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-green-600"
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(event) =>
							setStatusFilter(event.target.value)
						}
						className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-600">
						<option value="all">All statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
						<option value="upcoming">Upcoming</option>
						<option value="expired">Expired</option>
						<option value="out_of_stock">Out of stock</option>
					</select>

					<label className="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium text-gray-700">
						<input
							type="checkbox"
							checked={featuredOnly}
							onChange={(event) =>
								setFeaturedOnly(event.target.checked)
							}
							className="h-4 w-4 accent-green-700"
						/>
						<Star size={16} />
						Featured only
					</label>
				</div>

				<p className="mt-3 text-sm text-gray-500">
					Showing {filteredOffers.length} of {offers.length} offers
				</p>
			</section>

			{/* Offer list */}
			<section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
				{loading ? (
					<div className="flex min-h-64 items-center justify-center">
						<RefreshCw
							size={28}
							className="animate-spin text-green-700"
						/>
						<span className="ml-3 text-gray-600">
							Loading combo offers...
						</span>
					</div>
				) : filteredOffers.length === 0 ? (
					<div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
						<Package size={44} className="text-gray-300" />

						<h2 className="mt-4 text-lg font-bold text-gray-800">
							No combo offers found
						</h2>

						<p className="mt-1 text-sm text-gray-500">
							Try another search or create a new offer.
						</p>

						<Link
							href="/dashboard/admin/offers/create"
							className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
							Create Combo Offer
						</Link>
					</div>
				) : (
					<>
						{/* Desktop table */}
						<div className="hidden overflow-x-auto lg:block">
							<table className="w-full text-left text-sm">
								<thead className="bg-gray-50 text-xs uppercase text-gray-500">
									<tr>
										<th className="px-5 py-4">Offer</th>
										<th className="px-5 py-4">Items</th>
										<th className="px-5 py-4">Price</th>
										<th className="px-5 py-4">Stock</th>
										<th className="px-5 py-4">Schedule</th>
										<th className="px-5 py-4">Status</th>
										<th className="px-5 py-4 text-right">
											Actions
										</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-gray-100">
									{filteredOffers.map((offer) => {
										const status = getOfferStatus(offer);

										const discount =
											Number(offer.regularPrice) > 0
												? Math.round(
														((Number(
															offer.regularPrice
														) -
															Number(
																offer.offerPrice
															)) /
															Number(
																offer.regularPrice
															)) *
															100
													)
												: 0;

										return (
											<tr
												key={offer._id}
												className="hover:bg-gray-50">
												<td className="px-5 py-4">
													<div className="flex min-w-64 items-center gap-3">
														<img
															src={
																offer.featureImg
															}
															alt={offer.name}
															className="h-14 w-14 rounded-xl border object-cover"
														/>

														<div className="min-w-0">
															<p className="font-bold text-gray-900">
																{offer.name}
															</p>

															<p className="mt-1 break-all text-xs text-gray-500">
																{offer.slug}
															</p>

															{offer.isFeatured && (
																<span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
																	<Star
																		size={
																			12
																		}
																		fill="currentColor"
																	/>
																	Featured
																</span>
															)}
														</div>
													</div>
												</td>

												<td className="px-5 py-4">
													<div className="max-w-52 space-y-1">
														{(offer.items || [])
															.slice(0, 3)
															.map(
																(
																	item,
																	index
																) => (
																	<p
																		key={`${item.name}-${index}`}
																		className="text-gray-700">
																		{
																			item.name
																		}
																		<span className="ml-1 text-gray-400">
																			(
																			{
																				item.quantity
																			}
																			)
																		</span>
																	</p>
																)
															)}

														{(offer.items || [])
															.length > 3 && (
															<p className="text-xs text-gray-500">
																+
																{offer.items
																	.length -
																	3}{' '}
																more
															</p>
														)}
													</div>
												</td>

												<td className="whitespace-nowrap px-5 py-4">
													<p className="font-bold text-green-700">
														{money(
															offer.offerPrice
														)}
													</p>

													<p className="text-xs text-gray-400 line-through">
														{money(
															offer.regularPrice
														)}
													</p>

													{discount > 0 && (
														<span className="mt-1 inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-green-600">
															-{discount}%
														</span>
													)}
												</td>

												<td className="px-5 py-4">
													<p className="font-semibold text-gray-800">
														{offer.stock ?? 0}
													</p>
													<p className="text-xs text-gray-500">
														Sold: {offer.sold ?? 0}
													</p>
												</td>

												<td className="whitespace-nowrap px-5 py-4 text-xs text-gray-600">
													<p>
														Start:{' '}
														{formatDate(
															offer.startDate
														)}
													</p>
													<p className="mt-1">
														End:{' '}
														{formatDate(
															offer.endDate
														)}
													</p>
												</td>

												<td className="px-5 py-4">
													<span
														className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
														{STATUS_LABELS[status]}
													</span>
												</td>

												<td className="px-5 py-4">
													<div className="flex justify-end gap-2">
														<button
															type="button"
															title="Edit offer"
															onClick={() =>
																router.push(
																	`/dashboard/combo/${offer._id}/edit`
																)
															}
															className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50">
															<Pencil size={17} />
														</button>

														<button
															type="button"
															title="Delete offer"
															disabled={
																deletingId ===
																String(
																	offer._id
																)
															}
															onClick={() =>
																handleDelete(
																	offer
																)
															}
															className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50">
															<Trash2 size={17} />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* Mobile and tablet cards */}
						<div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
							{filteredOffers.map((offer) => {
								const status = getOfferStatus(offer);

								const discount =
									Number(offer.regularPrice) > 0
										? Math.round(
												((Number(offer.regularPrice) -
													Number(offer.offerPrice)) /
													Number(
														offer.regularPrice
													)) *
													100
											)
										: 0;

								return (
									<article
										key={offer._id}
										className="overflow-hidden rounded-2xl border">
										<div className="flex gap-3 p-4">
											<img
												src={offer.featureImg}
												alt={offer.name}
												className="h-20 w-20 rounded-xl border object-cover"
											/>

											<div className="min-w-0 flex-1">
												<h3 className="font-bold text-gray-900">
													{offer.name}
												</h3>

												<p className="mt-1 text-sm text-green-700">
													{money(offer.offerPrice)}
													<span className="ml-2 text-xs text-gray-400 line-through">
														{money(
															offer.regularPrice
														)}
													</span>
												</p>

												{discount > 0 && (
													<p className="mt-1 text-xs font-semibold text-green-600">
														{discount}% off
													</p>
												)}

												<span
													className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
													{STATUS_LABELS[status]}
												</span>
											</div>
										</div>

										<div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-600">
											<p>
												Stock: {offer.stock ?? 0}
												{' · '}
												Sold: {offer.sold ?? 0}
											</p>

											<p className="mt-1 text-xs">
												{formatDate(offer.startDate)}
												{' — '}
												{formatDate(offer.endDate)}
											</p>

											<div className="mt-3 flex flex-wrap gap-2">
												<button
													type="button"
													onClick={() =>
														router.push(
															`/dashboard/offers/${offer._id}/edit`
														)
													}
													className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-blue-700">
													<Pencil size={14} />
													Edit
												</button>

												<button
													type="button"
													disabled={
														deletingId ===
														String(offer._id)
													}
													onClick={() =>
														handleDelete(offer)
													}
													className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50">
													<Trash2 size={14} />
													Delete
												</button>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					</>
				)}
			</section>
		</main>
	);
}
