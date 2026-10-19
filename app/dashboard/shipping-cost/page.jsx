'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	Truck,
	Save,
	RefreshCw,
	MapPin,
	Gift,
	CheckCircle2,
	XCircle,
	Package,
	RotateCcw,
	Plus,
	Trash2,
	Pencil,
	X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULTS = {
	districtRates: [
		{ district: 'ঢাকা', charge: 70 },
		{ district: 'টাঙ্গাইল', charge: 100 },
		{ district: 'রাজশাহী', charge: 120 },
	],
	defaultCharge: 150,
	freeDeliveryEnabled: false,
	freeDeliveryMinimum: 2500,
};

const DISTRICTS = [
	'Dhaka',
	'Tangail',
	'Rajshahi',
	'Chattogram',
	'Gazipur',
	'Narayanganj',
	'Narsingdi',
	'Kishoreganj',
	'Mymensingh',
	'Jamalpur',
	'Sherpur',
	'Netrokona',
	'Faridpur',
	'Gopalganj',
	'Madaripur',
	'Shariatpur',
	'Rajbari',
	'Manikganj',
	'Munshiganj',
	'Cumilla',
	'Brahmanbaria',
	'Chandpur',
	'Lakshmipur',
	'Noakhali',
	'Feni',
	'Khagrachhari',
	'Rangamati',
	'Bandarban',
	"Cox's Bazar",
	'Sylhet',
	'Moulvibazar',
	'Habiganj',
	'Sunamganj',
	'Bogura',
	'Joypurhat',
	'Naogaon',
	'Natore',
	'Chapainawabganj',
	'Pabna',
	'Sirajganj',
	'Dinajpur',
	'Rangpur',
	'Gaibandha',
	'Kurigram',
	'Lalmonirhat',
	'Nilphamari',
	'Panchagarh',
	'Thakurgaon',
	'Jashore',
	'Khulna',
	'Satkhira',
	'Bagerhat',
	'Jhenaidah',
	'Magura',
	'Narail',
	'Kushtia',
	'Chuadanga',
	'Meherpur',
	'Barishal',
	'Bhola',
	'Patuakhali',
	'Pirojpur',
	'Barguna',
	'Jhalokathi',
];

const DISTRICT_LABELS = {
	Dhaka: 'ঢাকা',
	Tangail: 'টাঙ্গাইল',
	Rajshahi: 'রাজশাহী',
	Chattogram: 'চট্টগ্রাম',
	Gazipur: 'গাজীপুর',
	Narayanganj: 'নারায়ণগঞ্জ',
	Narsingdi: 'নরসিংদী',
	Kishoreganj: 'কিশোরগঞ্জ',
	Mymensingh: 'ময়মনসিংহ',
	Jamalpur: 'জামালপুর',
	Sherpur: 'শেরপুর',
	Netrokona: 'নেত্রকোণা',
	Faridpur: 'ফরিদপুর',
	Gopalganj: 'গোপালগঞ্জ',
	Madaripur: 'মাদারীপুর',
	Shariatpur: 'শরীয়তপুর',
	Rajbari: 'রাজবাড়ী',
	Manikganj: 'মানিকগঞ্জ',
	Munshiganj: 'মুন্সিগঞ্জ',
	Cumilla: 'কুমিল্লা',
	Brahmanbaria: 'ব্রাহ্মণবাড়িয়া',
	Chandpur: 'চাঁদপুর',
	Lakshmipur: 'লক্ষ্মীপুর',
	Noakhali: 'নোয়াখালী',
	Feni: 'ফেনী',
	Khagrachhari: 'খাগড়াছড়ি',
	Rangamati: 'রাঙামাটি',
	Bandarban: 'বান্দরবান',
	"Cox's Bazar": 'কক্সবাজার',
	Sylhet: 'সিলেট',
	Moulvibazar: 'মৌলভীবাজার',
	Habiganj: 'হবিগঞ্জ',
	Sunamganj: 'সুনামগঞ্জ',
	Bogura: 'বগুড়া',
	Joypurhat: 'জয়পুরহাট',
	Naogaon: 'নওগাঁ',
	Natore: 'নাটোর',
	Chapainawabganj: 'চাঁপাইনবাবগঞ্জ',
	Pabna: 'পাবনা',
	Sirajganj: 'সিরাজগঞ্জ',
	Dinajpur: 'দিনাজপুর',
	Rangpur: 'রংপুর',
	Gaibandha: 'গাইবান্ধা',
	Kurigram: 'কুড়িগ্রাম',
	Lalmonirhat: 'লালমনিরহাট',
	Nilphamari: 'নীলফামারী',
	Panchagarh: 'পঞ্চগড়',
	Thakurgaon: 'ঠাকুরগাঁও',
	Jashore: 'যশোর',
	Khulna: 'খুলনা',
	Satkhira: 'সাতক্ষীরা',
	Bagerhat: 'বাগেরহাট',
	Jhenaidah: 'ঝিনাইদহ',
	Magura: 'মাগুরা',
	Narail: 'নড়াইল',
	Kushtia: 'কুষ্টিয়া',
	Chuadanga: 'চুয়াডাঙ্গা',
	Meherpur: 'মেহেরপুর',
	Barishal: 'বরিশাল',
	Bhola: 'ভোলা',
	Patuakhali: 'পটুয়াখালী',
	Pirojpur: 'পিরোজপুর',
	Barguna: 'বরগুনা',
	Jhalokathi: 'ঝালকাঠি',
};

function normalizeDistrict(value = '') {
	return String(value).trim().toLocaleLowerCase('bn-BD').replace(/\s+/g, '');
}

function getCanonicalDistrict(value = '') {
	const normalized = normalizeDistrict(value);

	for (const [english, bangla] of Object.entries(DISTRICT_LABELS)) {
		if (
			normalized === normalizeDistrict(english) ||
			normalized === normalizeDistrict(bangla)
		) {
			return normalizeDistrict(bangla);
		}
	}

	return normalized;
}

function money(amount) {
	return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

function NumberField({
	label,
	name,
	value,
	onChange,
	description,
	disabled = false,
}) {
	return (
		<div>
			<label
				htmlFor={name}
				className="mb-2 block text-sm font-semibold text-gray-700">
				{label}
			</label>

			<div className="relative">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
					৳
				</span>

				<input
					id={name}
					name={name}
					type="number"
					min="0"
					max="1000000"
					step="1"
					required
					disabled={disabled}
					value={value}
					onChange={(e) => onChange(name, e.target.value)}
					className="w-full rounded-xl border border-gray-300 py-3 pl-9 pr-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
				/>
			</div>

			{description && (
				<p className="mt-1 text-xs text-gray-500">{description}</p>
			)}
		</div>
	);
}

function ShippingCostRow({
	icon: Icon,
	title,
	description,
	charge,
	color = 'green',
}) {
	const iconColors = {
		green: 'bg-green-50 text-green-700',
		blue: 'bg-blue-50 text-blue-700',
		amber: 'bg-amber-50 text-amber-700',
	};

	return (
		<div className="flex items-center justify-between gap-3 border-b border-gray-100 py-4 last:border-0">
			<div className="flex min-w-0 items-center gap-3">
				<div
					className={`rounded-xl p-3 ${iconColors[color] || iconColors.green}`}>
					<Icon size={21} />
				</div>

				<div className="min-w-0">
					<p className="font-semibold text-gray-800">{title}</p>
					<p className="text-sm text-gray-500">{description}</p>
				</div>
			</div>

			<strong className="shrink-0 text-lg text-gray-900">{charge}</strong>
		</div>
	);
}

export default function ShippingPage() {
	const [form, setForm] = useState(DEFAULTS);
	const [savedForm, setSavedForm] = useState(DEFAULTS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [selectedDistrict, setSelectedDistrict] = useState('');
	const [selectedCharge, setSelectedCharge] = useState('70');
	const [editingDistrict, setEditingDistrict] = useState('');

	const loadSettings = useCallback(async () => {
		setLoading(true);

		try {
			const res = await fetch('/api/shipping', {
				cache: 'no-store',
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Shipping settings লোড হয়নি');
			}

			const settings = {
				...DEFAULTS,
				...data.settings,
				districtRates: Array.isArray(data.settings?.districtRates)
					? data.settings.districtRates.map((rate) => ({
							district: rate.district,
							charge: Number(rate.charge),
						}))
					: DEFAULTS.districtRates.map((rate) => ({ ...rate })),
			};

			setForm(settings);
			setSavedForm({
				...settings,
				districtRates: settings.districtRates.map((rate) => ({
					...rate,
				})),
			});
		} catch (error) {
			toast.error(error.message || 'সেটিংস লোড হয়নি');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	function updateField(name, value) {
		setForm((previous) => ({
			...previous,
			[name]:
				name === 'freeDeliveryEnabled'
					? value
					: value === ''
						? ''
						: Number(value),
		}));
	}

	function removeDistrictRate(index) {
		setForm((previous) => ({
			...previous,
			districtRates: previous.districtRates.filter((_, i) => i !== index),
		}));
	}

	function handleDistrictSubmit(event) {
		event.preventDefault();

		if (saving) return;

		const district = selectedDistrict.trim();
		const charge = Number(selectedCharge);

		if (!district) {
			toast.error('একটি জেলা নির্বাচন করুন');
			return;
		}

		if (
			selectedCharge === '' ||
			!Number.isInteger(charge) ||
			charge < 0 ||
			charge > 1000000
		) {
			toast.error('সঠিক ডেলিভারি চার্জ লিখুন');
			return;
		}

		const selectedKey = getCanonicalDistrict(district);
		const editingKey = getCanonicalDistrict(editingDistrict);

		const duplicate = form.districtRates.some((rate) => {
			const rateKey = getCanonicalDistrict(rate.district);

			if (editingDistrict && rateKey === editingKey) {
				return false;
			}

			return rateKey === selectedKey;
		});

		if (duplicate) {
			toast.error(
				'এই জেলার চার্জ আগে থেকেই আছে। Edit বাটন ব্যবহার করুন।'
			);
			return;
		}

		setForm((previous) => {
			let districtRates = [...previous.districtRates];

			if (editingDistrict) {
				const index = districtRates.findIndex(
					(rate) => getCanonicalDistrict(rate.district) === editingKey
				);

				if (index !== -1) {
					districtRates[index] = { district, charge };
				} else {
					districtRates.push({ district, charge });
				}
			} else {
				districtRates.push({ district, charge });
			}

			return { ...previous, districtRates };
		});

		setSelectedDistrict('');
		setSelectedCharge('70');
		setEditingDistrict('');

		toast.success(
			editingDistrict
				? 'চার্জ পরিবর্তন হয়েছে। পরিবর্তন সংরক্ষণ করতে Save Settings চাপুন।'
				: 'জেলা যোগ হয়েছে। পরিবর্তন সংরক্ষণ করতে Save Settings চাপুন।'
		);
	}

	function editDistrictRate(rate) {
		const matchingEnglish = DISTRICTS.find(
			(district) =>
				getCanonicalDistrict(district) ===
				getCanonicalDistrict(rate.district)
		);

		setSelectedDistrict(matchingEnglish || rate.district);
		setSelectedCharge(String(rate.charge));
		setEditingDistrict(rate.district);

		document
			.getElementById('district-rate-form')
			?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	function cancelDistrictEdit() {
		setSelectedDistrict('');
		setSelectedCharge('70');
		setEditingDistrict('');
	}

	function resetForm() {
		setForm({
			...savedForm,
			districtRates: savedForm.districtRates.map((rate) => ({
				...rate,
			})),
		});

		cancelDistrictEdit();
		toast.success('সেভ করা সেটিংস ফিরিয়ে আনা হয়েছে');
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (saving) return;

		const amounts = [
			form.defaultCharge,
			form.freeDeliveryMinimum,
			...form.districtRates.map((rate) => rate.charge),
		];

		if (
			amounts.some(
				(value) =>
					value === '' ||
					!Number.isFinite(Number(value)) ||
					Number(value) < 0 ||
					Number(value) > 1000000
			)
		) {
			toast.error('সঠিক টাকার পরিমাণ লিখুন');
			return;
		}

		if (amounts.some((value) => !Number.isInteger(Number(value)))) {
			toast.error('টাকার পরিমাণ পূর্ণ সংখ্যা হতে হবে');
			return;
		}

		if (
			form.districtRates.some(
				(rate) => !String(rate.district || '').trim()
			)
		) {
			toast.error('প্রতিটি রেটের জেলা নির্বাচন করুন');
			return;
		}

		const districtKeys = form.districtRates.map((rate) =>
			getCanonicalDistrict(rate.district)
		);

		if (new Set(districtKeys).size !== districtKeys.length) {
			toast.error('একই জেলার জন্য একাধিক চার্জ রাখা যাবে না');
			return;
		}

		setSaving(true);

		try {
			const payload = {
				districtRates: form.districtRates.map((rate) => ({
					district: rate.district.trim(),
					charge: Number(rate.charge),
				})),
				defaultCharge: Number(form.defaultCharge),
				freeDeliveryEnabled: Boolean(form.freeDeliveryEnabled),
				freeDeliveryMinimum: Number(form.freeDeliveryMinimum),
			};

			const res = await fetch('/api/shipping', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'Shipping settings আপডেট হয়নি');
			}

			const settings = {
				...DEFAULTS,
				...data.settings,
				districtRates: Array.isArray(data.settings?.districtRates)
					? data.settings.districtRates.map((rate) => ({
							district: rate.district,
							charge: Number(rate.charge),
						}))
					: payload.districtRates,
			};

			setForm(settings);
			setSavedForm({
				...settings,
				districtRates: settings.districtRates.map((rate) => ({
					...rate,
				})),
			});

			toast.success('Shipping settings সফলভাবে সংরক্ষণ হয়েছে');
		} catch (error) {
			toast.error(error.message || 'সেটিংস সংরক্ষণ করা যায়নি');
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-64 items-center justify-center gap-3 text-gray-600">
				<RefreshCw className="animate-spin" size={20} />
				<span>Shipping settings লোড হচ্ছে...</span>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<Truck className="text-green-800" size={28} />
						<h1 className="text-2xl font-bold text-gray-900">
							Shipping Management
						</h1>
					</div>
					<p className="mt-2 text-sm text-gray-500">
						জেলা অনুযায়ী ডেলিভারি চার্জ ও ফ্রি ডেলিভারি পরিচালনা
						করুন।
					</p>
				</div>

				<button
					type="button"
					onClick={loadSettings}
					disabled={saving}
					className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-medium hover:bg-gray-50 disabled:opacity-50">
					<RefreshCw size={16} />
					Refresh
				</button>
			</div>

			{/* Summary */}
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					<MapPin className="mb-3 text-green-700" size={23} />
					<p className="text-sm text-gray-500">
						Custom District Rates
					</p>
					<p className="mt-1 text-2xl font-bold">
						{form.districtRates.length}
					</p>
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					<Truck className="mb-3 text-blue-700" size={23} />
					<p className="text-sm text-gray-500">Default Charge</p>
					<p className="mt-1 text-2xl font-bold">
						{money(form.defaultCharge)}
					</p>
				</div>

				<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					{form.freeDeliveryEnabled ? (
						<CheckCircle2
							className="mb-3 text-green-700"
							size={23}
						/>
					) : (
						<XCircle className="mb-3 text-red-600" size={23} />
					)}
					<p className="text-sm text-gray-500">Free Delivery</p>
					<p className="mt-1 text-xl font-bold">
						{form.freeDeliveryEnabled ? 'Enabled' : 'Disabled'}
					</p>
				</div>
			</div>

			{/* Single district add/edit form */}
			<section
				id="district-rate-form"
				className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
				<div className="mb-5 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-blue-50 p-3 text-blue-700">
							{editingDistrict ? (
								<Pencil size={23} />
							) : (
								<Plus size={23} />
							)}
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">
								{editingDistrict
									? 'Edit District Charge'
									: 'Add District Charge'}
							</h2>
							<p className="text-sm text-gray-500">
								জেলা নির্বাচন করুন এবং ডেলিভারি চার্জ লিখুন।
							</p>
						</div>
					</div>

					{editingDistrict && (
						<button
							type="button"
							onClick={cancelDistrictEdit}
							className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
							<X size={16} />
							Cancel
						</button>
					)}
				</div>

				<form
					onSubmit={handleDistrictSubmit}
					className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
					<div>
						<label
							htmlFor="district-select"
							className="mb-2 block text-sm font-semibold text-gray-700">
							জেলা নির্বাচন করুন
						</label>

						<select
							id="district-select"
							value={selectedDistrict}
							onChange={(e) =>
								setSelectedDistrict(e.target.value)
							}
							required
							disabled={saving}
							className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100">
							<option value="">জেলা নির্বাচন করুন</option>

							{DISTRICTS.map((district) => {
								const label =
									DISTRICT_LABELS[district] || district;
								const districtKey =
									getCanonicalDistrict(district);
								const existing = form.districtRates.find(
									(rate) =>
										getCanonicalDistrict(rate.district) ===
										districtKey
								);

								const isCurrentEditing =
									editingDistrict &&
									getCanonicalDistrict(editingDistrict) ===
										districtKey;

								return (
									<option
										key={district}
										value={district}
										disabled={
											Boolean(existing) &&
											!isCurrentEditing
										}>
										{label} ({district})
										{existing && !isCurrentEditing
											? ' — আগে যোগ করা হয়েছে'
											: ''}
									</option>
								);
							})}
						</select>
					</div>

					<div>
						<label
							htmlFor="district-charge"
							className="mb-2 block text-sm font-semibold text-gray-700">
							ডেলিভারি চার্জ (৳)
						</label>
						<input
							id="district-charge"
							type="number"
							min="0"
							max="1000000"
							step="1"
							required
							value={selectedCharge}
							onChange={(e) => setSelectedCharge(e.target.value)}
							disabled={saving}
							placeholder="যেমন 70"
							className="w-full rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
						/>
					</div>

					<button
						type="submit"
						disabled={saving}
						className="flex items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50">
						{editingDistrict ? (
							<Save size={17} />
						) : (
							<Plus size={17} />
						)}
						{editingDistrict ? 'Update Charge' : 'Add District'}
					</button>
				</form>

				<p className="mt-3 text-xs text-gray-500">
					Add/Update করার পর নিচের Save Settings বাটনে চাপ দিয়ে
					পরিবর্তন স্থায়ীভাবে সংরক্ষণ করুন।
				</p>
			</section>

			{/* Settings form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Default charge */}
				<section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
					<h2 className="mb-5 text-lg font-bold text-gray-900">
						Default Delivery Charge
					</h2>
					<div className="max-w-md">
						<NumberField
							label="অন্যান্য জেলার ডেলিভারি চার্জ"
							name="defaultCharge"
							value={form.defaultCharge}
							onChange={updateField}
							description="যেসব জেলার আলাদা চার্জ সেট করা নেই, তাদের জন্য এই চার্জ প্রযোজ্য হবে।"
							disabled={saving}
						/>
					</div>
				</section>

				{/* Free delivery */}
				<section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="rounded-xl bg-amber-50 p-3 text-amber-700">
								<Gift size={23} />
							</div>
							<div>
								<h2 className="font-bold text-gray-900">
									Free Delivery Settings
								</h2>
								<p className="text-sm text-gray-500">
									নির্দিষ্ট অর্ডার মূল্যে ডেলিভারি চার্জ মওকুফ
									করুন।
								</p>
							</div>
						</div>

						<label className="flex cursor-pointer items-center gap-3">
							<span className="text-sm font-semibold">
								{form.freeDeliveryEnabled ? 'চালু' : 'বন্ধ'}
							</span>
							<input
								type="checkbox"
								checked={form.freeDeliveryEnabled}
								disabled={saving}
								onChange={(e) =>
									updateField(
										'freeDeliveryEnabled',
										e.target.checked
									)
								}
								className="h-5 w-5 accent-green-700"
							/>
						</label>
					</div>

					{form.freeDeliveryEnabled && (
						<div className="mt-5 max-w-md">
							<NumberField
								label="Free Delivery Minimum Order"
								name="freeDeliveryMinimum"
								value={form.freeDeliveryMinimum}
								onChange={updateField}
								description="পণ্যের মোট মূল্য এই পরিমাণ বা তার বেশি হলে ডেলিভারি ফ্রি হবে।"
								disabled={saving}
							/>
						</div>
					)}
				</section>

				{/* Save / reset */}
				<div className="flex flex-wrap justify-end gap-3">
					<button
						type="button"
						onClick={resetForm}
						disabled={saving}
						className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50">
						<RotateCcw size={17} />
						Reset Changes
					</button>

					<button
						type="submit"
						disabled={saving}
						className="flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60">
						{saving ? (
							<RefreshCw className="animate-spin" size={18} />
						) : (
							<Save size={18} />
						)}
						{saving ? 'Saving...' : 'Save Settings'}
					</button>
				</div>
			</form>

			{/* District delivery charges - 2 columns */}
			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
				<div className="flex items-center gap-3 border-b border-gray-100 p-5">
					<div className="rounded-xl bg-green-50 p-3 text-green-800">
						<Package size={23} />
					</div>

					<div>
						<h2 className="text-lg font-bold text-gray-900">
							District Delivery Charges
						</h2>
						<p className="text-sm text-gray-500">
							জেলা অনুযায়ী ডেলিভারি চার্জ দেখুন ও পরিচালনা করুন।
						</p>
					</div>
				</div>

				{form.districtRates.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						এখনো কোনো জেলার আলাদা চার্জ যোগ করা হয়নি।
					</div>
				) : (
					<div className="grid grid-cols-1 gap-0 md:grid-cols-2">
						{form.districtRates.map((rate, index) => (
							<div
								key={getCanonicalDistrict(rate.district)}
								className={`min-w-0 border-b border-gray-100 p-4 ${
									index % 2 === 0 ? 'md:border-r' : ''
								}`}>
								<div className="flex items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-2">
										<div className="min-w-0">
											<p className="truncate font-semibold text-gray-900">
												{rate.district} -{' '}
												{money(rate.charge)}
											</p>
										</div>
									</div>

									<div className="flex shrink-0 flex-col gap-2 sm:flex-row">
										<button
											type="button"
											onClick={() =>
												editDistrictRate(rate)
											}
											disabled={saving}
											className="inline-flex items-center justify-center gap-1 rounded-lg border border-green-200 px-2.5 py-2 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-50">
											<Pencil size={14} />
											Edit
										</button>

										<button
											type="button"
											onClick={() => {
												const indexToRemove =
													form.districtRates.findIndex(
														(item) =>
															getCanonicalDistrict(
																item.district
															) ===
															getCanonicalDistrict(
																rate.district
															)
													);

												removeDistrictRate(
													indexToRemove
												);

												if (
													getCanonicalDistrict(
														editingDistrict
													) ===
													getCanonicalDistrict(
														rate.district
													)
												) {
													cancelDistrictEdit();
												}
											}}
											disabled={saving}
											className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
											<Trash2 size={14} />
											Remove
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Default delivery charge */}
				<div className="border-t border-blue-100 bg-blue-50/70 p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Truck
								size={22}
								className="shrink-0 text-blue-700"
							/>
							<div>
								<p className="font-semibold text-gray-900">
									অন্যান্য জেলা
								</p>
								<p className="text-sm text-gray-500">
									Default delivery charge
								</p>
							</div>
						</div>

						<strong className="text-xl font-extrabold text-blue-800">
							{money(form.defaultCharge)}
						</strong>
					</div>
				</div>
			</section>
		</div>
	);
}
