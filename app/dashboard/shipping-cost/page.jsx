'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Truck,
	Plus,
	Search,
	Pencil,
	Trash2,
	Save,
	X,
	RefreshCw,
	MapPin,
	Settings,
	Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DISTRICTS } from '@/constants';

const API_URL = '/api/shipping';



const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`;

const inputClass =
	'w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-900';

const buttonClass =
	'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

const emptyForm = {
	district: '',
	charge: '',
};

export default function ShippingPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [defaultCharge, setDefaultCharge] = useState('150');
	const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
	const [freeDeliveryMinimum, setFreeDeliveryMinimum] = useState('2500');

	const [districtRates, setDistrictRates] = useState([]);
	const [search, setSearch] = useState('');
	const [form, setForm] = useState(emptyForm);
	const [editingDistrict, setEditingDistrict] = useState(null);
	const [showForm, setShowForm] = useState(false);

	const fetchSettings = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(API_URL, {
				method: 'GET',
				cache: 'no-store',
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to load settings');
			}

			const settings = data.shippingCost || data.data || data;

			setDefaultCharge(String(settings.defaultCharge ?? 150));
			setFreeDeliveryEnabled(
				Boolean(settings.freeDeliveryEnabled ?? false)
			);
			setFreeDeliveryMinimum(
				String(settings.freeDeliveryMinimum ?? 2500)
			);

			setDistrictRates(
				Array.isArray(settings.districtRates)
					? settings.districtRates.map((item) => ({
							district: item.district,
							charge: Number(item.charge ?? 0),
						}))
					: []
			);
		} catch (error) {
			toast.error(error.message || 'Failed to load shipping settings');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	const filteredRates = useMemo(() => {
		const query = search.trim().toLowerCase();

		return [...districtRates]
			.filter((item) => item.district.toLowerCase().includes(query))
			.sort((a, b) => a.district.localeCompare(b.district));
	}, [districtRates, search]);

	const availableDistricts = useMemo(() => {
		return DISTRICTS.filter(
			(district) =>
				!districtRates.some(
					(item) =>
						item.district.toLowerCase() ===
							district.toLowerCase() &&
						item.district !== editingDistrict
				)
		);
	}, [districtRates, editingDistrict]);

	const resetForm = () => {
		setForm(emptyForm);
		setEditingDistrict(null);
		setShowForm(false);
	};

	const startAdd = () => {
		resetForm();
		setShowForm(true);
	};

	const startEdit = (rate) => {
		setEditingDistrict(rate.district);
		setForm({
			district: rate.district,
			charge: String(rate.charge),
		});
		setShowForm(true);
	};

	const handleSubmitDistrict = (event) => {
		event.preventDefault();

		const district = form.district.trim();
		const charge = Number(form.charge);

		if (!district) {
			toast.error('Please select a district');
			return;
		}

		if (form.charge === '' || !Number.isFinite(charge) || charge < 0) {
			toast.error('Enter a valid delivery charge');
			return;
		}

		const duplicate = districtRates.some(
			(item) =>
				item.district.toLowerCase() === district.toLowerCase() &&
				item.district !== editingDistrict
		);

		if (duplicate) {
			toast.error('This district already exists');
			return;
		}

		if (editingDistrict) {
			setDistrictRates((prev) =>
				prev.map((item) =>
					item.district === editingDistrict
						? { district, charge }
						: item
				)
			);

			toast.success('District updated');
		} else {
			setDistrictRates((prev) => [...prev, { district, charge }]);
			toast.success('District added');
		}

		resetForm();
	};

	const deleteDistrict = (district) => {
		if (!window.confirm(`Delete the shipping rate for ${district}?`)) {
			return;
		}

		setDistrictRates((prev) =>
			prev.filter((item) => item.district !== district)
		);

		if (editingDistrict === district) {
			resetForm();
		}

		toast.success('District removed from the list');
	};

	const saveSettings = async (event) => {
		event.preventDefault();

		if (
			defaultCharge === '' ||
			!Number.isFinite(Number(defaultCharge)) ||
			Number(defaultCharge) < 0
		) {
			toast.error('Enter a valid default delivery charge');
			return;
		}

		if (
			freeDeliveryMinimum === '' ||
			!Number.isFinite(Number(freeDeliveryMinimum)) ||
			Number(freeDeliveryMinimum) < 0
		) {
			toast.error('Enter a valid free delivery minimum');
			return;
		}

		if (
			districtRates.some(
				(item) =>
					item.charge === '' ||
					!Number.isFinite(Number(item.charge)) ||
					Number(item.charge) < 0
			)
		) {
			toast.error('Please check all district charges');
			return;
		}

		setSaving(true);

		try {
			const payload = {
				defaultCharge: Number(defaultCharge),
				freeDeliveryEnabled,
				freeDeliveryMinimum: Number(freeDeliveryMinimum),
				districtRates: districtRates.map((item) => ({
					district: item.district,
					charge: Number(item.charge),
				})),
			};

			const res = await fetch(API_URL, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to save settings');
			}

			toast.success('All shipping settings saved');
			await fetchSettings();
		} catch (error) {
			toast.error(error.message || 'Failed to save settings');
		} finally {
			setSaving(false);
		}
	};

	const resetSettings = async () => {
		if (
			!window.confirm(
				'Delete all saved shipping settings? This action cannot be undone.'
			)
		) {
			return;
		}

		setSaving(true);

		try {
			const res = await fetch(API_URL, { method: 'DELETE' });
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to reset settings');
			}

			setDefaultCharge('150');
			setFreeDeliveryEnabled(false);
			setFreeDeliveryMinimum('2500');
			setDistrictRates([]);
			resetForm();

			toast.success('Shipping settings reset');
			await fetchSettings();
		} catch (error) {
			toast.error(error.message || 'Reset failed');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 p-4 text-gray-100 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-6xl space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2 text-green-400">
							<Truck size={23} />
							<span className="text-sm font-semibold">
								Shalban Food Admin
							</span>
						</div>

						<h1 className="text-2xl font-bold sm:text-3xl">
							Shipping Management
						</h1>

						<p className="mt-2 text-sm text-gray-400">
							Manage district delivery charges easily.
						</p>
					</div>

					<button
						type="button"
						onClick={fetchSettings}
						disabled={loading || saving}
						className={`${buttonClass} border border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800`}>
						<RefreshCw
							size={16}
							className={loading ? 'animate-spin' : ''}
						/>
						Refresh
					</button>
				</div>

				{loading ? (
					<div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center">
						<RefreshCw
							size={28}
							className="mx-auto animate-spin text-green-400"
						/>
						<p className="mt-3 text-sm text-gray-400">
							Loading shipping settings...
						</p>
					</div>
				) : (
					<form onSubmit={saveSettings} className="space-y-6">
						{/* Summary cards */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-400">
										Default Charge
									</p>
									<Truck
										size={20}
										className="text-green-400"
									/>
								</div>
								<p className="mt-3 text-2xl font-bold">
									{money(defaultCharge)}
								</p>
							</div>

							<div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-400">
										District Rates
									</p>
									<MapPin
										size={20}
										className="text-blue-400"
									/>
								</div>
								<p className="mt-3 text-2xl font-bold">
									{districtRates.length}
								</p>
							</div>

							<div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-400">
										Free Delivery
									</p>
									<Check
										size={20}
										className="text-green-400"
									/>
								</div>
								<p className="mt-3 text-2xl font-bold">
									{freeDeliveryEnabled
										? 'Enabled'
										: 'Disabled'}
								</p>
							</div>
						</div>

						{/* General settings */}
						<section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-6">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-xl bg-gray-800 p-3 text-green-400">
									<Settings size={21} />
								</div>
								<div>
									<h2 className="text-lg font-bold">
										General Settings
									</h2>
									<p className="text-sm text-gray-400">
										Set your default and free delivery
										rules.
									</p>
								</div>
							</div>

							<div className="grid gap-5 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium text-gray-300">
										Default Delivery Charge (৳)
									</label>
									<input
										type="number"
										min="0"
										step="1"
										required
										value={defaultCharge}
										onChange={(e) =>
											setDefaultCharge(e.target.value)
										}
										className={inputClass}
										placeholder="150"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-300">
										Free Delivery Minimum (৳)
									</label>
									<input
										type="number"
										min="0"
										step="1"
										required
										value={freeDeliveryMinimum}
										onChange={(e) =>
											setFreeDeliveryMinimum(
												e.target.value
											)
										}
										className={inputClass}
										placeholder="2500"
									/>
								</div>
							</div>

							<div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
								<div>
									<p className="font-semibold">
										Enable Free Delivery
									</p>
									<p className="mt-1 text-xs text-gray-400">
										Free delivery for eligible orders.
									</p>
								</div>

								<button
									type="button"
									role="switch"
									aria-checked={freeDeliveryEnabled}
									onClick={() =>
										setFreeDeliveryEnabled((prev) => !prev)
									}
									className={`relative h-7 w-12 shrink-0 rounded-full transition ${
										freeDeliveryEnabled
											? 'bg-green-600'
											: 'bg-gray-600'
									}`}>
									<span
										className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
											freeDeliveryEnabled
												? 'left-6'
												: 'left-1'
										}`}
									/>
								</button>
							</div>
						</section>

						{/* Shipping list management */}
						<section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
							<div className="flex flex-col gap-4 border-b border-gray-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
								<div>
									<h2 className="text-lg font-bold">
										Shipping List
									</h2>
									<p className="mt-1 text-sm text-gray-400">
										Add, edit or remove district delivery
										charges.
									</p>
								</div>

								<button
									type="button"
									onClick={startAdd}
									className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}>
									<Plus size={18} />
									Add District
								</button>
							</div>

							{/* Add / edit form */}
							{showForm && (
								<div className="border-b border-gray-800 bg-gray-800/40 p-5 sm:p-6">
									<div className="mb-4 flex items-center justify-between">
										<h3 className="font-semibold">
											{editingDistrict
												? 'Edit District'
												: 'Add New District'}
										</h3>

										<button
											type="button"
											onClick={resetForm}
											className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
											aria-label="Close form">
											<X size={18} />
										</button>
									</div>

									<div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
										<div>
											<label className="mb-2 block text-sm text-gray-300">
												District Name (English)
											</label>
											<select
												value={form.district}
												onChange={(e) =>
													setForm((prev) => ({
														...prev,
														district:
															e.target.value,
													}))
												}
												className={inputClass}
												required>
												<option value="">
													Select district
												</option>
												{DISTRICTS.filter(
													(district) =>
														!districtRates.some(
															(item) =>
																item.district.toLowerCase() ===
																	district.toLowerCase() &&
																item.district !==
																	editingDistrict
														)
												).map((district) => (
													<option
														key={district}
														value={district}>
														{district}
													</option>
												))}
												{editingDistrict &&
													!DISTRICTS.some(
														(d) =>
															d.toLowerCase() ===
															editingDistrict.toLowerCase()
													) && (
														<option
															value={
																editingDistrict
															}>
															{editingDistrict}
														</option>
													)}
											</select>
										</div>

										<div>
											<label className="mb-2 block text-sm text-gray-300">
												Delivery Charge (৳)
											</label>
											<input
												type="number"
												min="0"
												step="1"
												required
												value={form.charge}
												onChange={(e) =>
													setForm((prev) => ({
														...prev,
														charge: e.target.value,
													}))
												}
												className={inputClass}
												placeholder="70"
											/>
										</div>

										<div className="flex gap-2">
											<button
												type="button"
												onClick={resetForm}
												className={`${buttonClass} border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700`}>
												Cancel
											</button>

											<button
												type="button"
												onClick={handleSubmitDistrict}
												className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}>
												<Check size={16} />
												{editingDistrict
													? 'Update'
													: 'Add'}
											</button>
										</div>
									</div>
								</div>
							)}

							{/* Search and count */}
							<div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
								<div className="relative w-full sm:max-w-sm">
									<Search
										size={18}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
									/>
									<input
										type="search"
										value={search}
										onChange={(e) =>
											setSearch(e.target.value)
										}
										placeholder="Search district..."
										className={`${inputClass} pl-10`}
									/>
								</div>

								<p className="text-sm text-gray-400">
									Showing{' '}
									<span className="font-semibold text-white">
										{filteredRates.length}
									</span>{' '}
									of {districtRates.length} districts
								</p>
							</div>

							{/* Table */}
							<div className="overflow-x-auto">
								<table className="w-full min-w-[560px] text-left text-sm">
									<thead className="bg-gray-800 text-gray-300">
										<tr>
											<th className="px-5 py-4 font-semibold">
												#
											</th>
											<th className="px-5 py-4 font-semibold">
												District Name
											</th>
											<th className="px-5 py-4 font-semibold">
												Delivery Charge
											</th>
											<th className="px-5 py-4 text-right font-semibold">
												Actions
											</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-gray-800">
										{filteredRates.map((rate, index) => (
											<tr
												key={rate.district}
												className="transition hover:bg-gray-800/60">
												<td className="px-5 py-4 text-gray-500">
													{index + 1}
												</td>

												<td className="px-5 py-4">
													<div className="flex items-center gap-3">
														<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-green-400">
															<MapPin size={17} />
														</span>
														<span className="font-semibold text-white">
															{rate.district}
														</span>
													</div>
												</td>

												<td className="px-5 py-4">
													<span className="inline-flex rounded-lg bg-green-500/10 px-3 py-1.5 font-bold text-green-400">
														{money(rate.charge)}
													</span>
												</td>

												<td className="px-5 py-4">
													<div className="flex justify-end gap-2">
														<button
															type="button"
															onClick={() =>
																startEdit(rate)
															}
															className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-blue-400 transition hover:bg-blue-500/20">
															<Pencil size={15} />
															Edit
														</button>

														<button
															type="button"
															onClick={() =>
																deleteDistrict(
																	rate.district
																)
															}
															className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 transition hover:bg-red-500/20">
															<Trash2 size={15} />
															Delete
														</button>
													</div>
												</td>
											</tr>
										))}

										{filteredRates.length === 0 && (
											<tr>
												<td
													colSpan={4}
													className="px-5 py-12 text-center">
													<MapPin
														size={30}
														className="mx-auto text-gray-600"
													/>
													<p className="mt-3 font-medium text-gray-300">
														No districts found
													</p>
													<p className="mt-1 text-sm text-gray-500">
														Try another search or
														add a district.
													</p>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							<div className="border-t border-gray-800 p-4 text-xs text-gray-500">
								Changes are not permanent until you click Save
								Settings.
							</div>
						</section>

						{/* Bottom actions */}
						<div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
							<button
								type="button"
								onClick={resetSettings}
								disabled={saving}
								className={`${buttonClass} border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20`}>
								<Trash2 size={16} />
								Reset All Settings
							</button>

							<button
								type="submit"
								disabled={saving}
								className={`${buttonClass} bg-green-600 px-6 text-white hover:bg-green-700`}>
								{saving ? (
									<RefreshCw
										size={17}
										className="animate-spin"
									/>
								) : (
									<Save size={17} />
								)}
								{saving ? 'Saving...' : 'Save Settings'}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
