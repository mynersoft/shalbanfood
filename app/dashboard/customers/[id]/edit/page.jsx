'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import {
	ArrowLeft,
	UserRoundPen,
	User,
	Phone,
	MapPin,
	LockKeyhole,
	Loader2,
	Save,
	RefreshCw,
} from 'lucide-react';

const initialForm = {
	name: '',
	phone: '',
	area: '',
	thana: '',
	city: '',
};

export default function EditCustomerPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id;

	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const fetchCustomer = useCallback(async () => {
		if (!id) return;

		try {
			setLoading(true);

			const res = await fetch(
				`/api/customers/${encodeURIComponent(id)}`,
				{ cache: 'no-store' }
			);

			const data = await res.json();

			console.log(data);
			

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'কাস্টমারের তথ্য পাওয়া যায়নি।');
			}

			const customer = data.customer;

			setForm({
				name: customer.name || '',
				phone: customer.phone || '',
				area: customer.address?.area || '',
				thana: customer.address?.thana || '',
				city: customer.address?.city || '',
			});
		} catch (error) {
			toast.error(error.message || 'কাস্টমারের তথ্য লোড করা যায়নি।');
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchCustomer();
	}, [fetchCustomer]);

	const updateField = (field, value) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const phone = form.phone.replace(/\s+/g, '').trim();
		const name = form.name.trim();

		if (!/^01[3-9]\d{8}$/.test(phone)) {
			toast.error('সঠিক ১১ ডিজিটের বাংলাদেশি ফোন নম্বর দিন।');
			return;
		}

		if (name.length > 100) {
			toast.error('নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারবে।');
			return;
		}

		try {
			setSaving(true);

			const res = await fetch(
				`/api/customers/${encodeURIComponent(id)}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name,
						phone,
						address: {
							area: form.area.trim(),
							thana: form.thana.trim(),
							city: form.city.trim(),
						},
					}),
				}
			);

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(
					data.message || 'কাস্টমারের তথ্য আপডেট করা যায়নি।'
				);
			}

			toast.success(data.message || 'কাস্টমারের তথ্য আপডেট হয়েছে।');

			router.push('/dashboard/customers');
			router.refresh();
		} catch (error) {
			toast.error(error.message || 'কিছু একটা সমস্যা হয়েছে।');
		} finally {
			setSaving(false);
		}
	};

	const inputClass =
		'w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#4d9a70] focus:ring-2 focus:ring-[#4d9a70]/20 disabled:cursor-not-allowed disabled:opacity-60';

	const labelClass = 'mb-1.5 block text-sm font-medium text-slate-200';

	if (loading) {
		return (
			<div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-slate-400">
				<Loader2 size={30} className="animate-spin text-[#4d9a70]" />
				<p className="text-sm">কাস্টমারের তথ্য লোড হচ্ছে...</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-5 pb-10">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link
					href="/dashboard/customers"
					aria-label="Back to customers"
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800">
					<ArrowLeft size={19} />
				</Link>

				<div className="min-w-0 flex-1">
					<h1 className="text-base font-semibold text-slate-100">
						Edit Customer
					</h1>
					<p className="mt-1 text-sm text-slate-400">
						কাস্টমারের তথ্য পরিবর্তন করুন।
					</p>
				</div>

				<button
					type="button"
					onClick={fetchCustomer}
					disabled={saving || loading}
					title="Reload customer"
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800 disabled:opacity-50">
					<RefreshCw size={17} />
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Customer Information */}
				<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
					<div className="mb-5 flex items-center gap-2 border-b border-slate-800 pb-4">
						<UserRoundPen size={19} className="text-[#4d9a70]" />
						<h2 className="font-semibold text-slate-100">
							Customer Information
						</h2>
					</div>

					<div className="grid gap-5 sm:grid-cols-2">
						{/* Name */}
						<div className="sm:col-span-2">
							<label htmlFor="name" className={labelClass}>
								Customer Name
							</label>

							<div className="relative">
								<User
									size={17}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
								/>

								<input
									id="name"
									type="text"
									value={form.name}
									onChange={(e) =>
										updateField('name', e.target.value)
									}
									placeholder="কাস্টমারের নাম"
									maxLength={100}
									disabled={saving}
									className={`${inputClass} pl-10`}
								/>
							</div>

							<p className="mt-1 text-xs text-slate-500">
								নাম খালি রাখলে ফোন নম্বরটি নাম হিসেবে ব্যবহার
								হবে।
							</p>
						</div>

						{/* Phone */}
						<div className="sm:col-span-2">
							<label htmlFor="phone" className={labelClass}>
								Phone Number *
							</label>

							<div className="relative">
								<Phone
									size={17}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
								/>

								<input
									id="phone"
									type="tel"
									inputMode="numeric"
									required
									value={form.phone}
									onChange={(e) =>
										updateField(
											'phone',
											e.target.value.replace(/[^\d]/g, '')
										)
									}
									placeholder="01XXXXXXXXX"
									maxLength={11}
									disabled={saving}
									className={`${inputClass} pl-10`}
								/>
							</div>

							<p className="mt-1 text-xs text-slate-500">
								অন্য কাস্টমারের ব্যবহৃত ফোন নম্বর দেওয়া যাবে না।
							</p>
						</div>
					</div>
				</div>

				{/* Login Information */}
				<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
					<div className="mb-4 flex items-center gap-2">
						<LockKeyhole size={19} className="text-[#4d9a70]" />
						<h2 className="font-semibold text-slate-100">
							Login Information
						</h2>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
						<p className="text-sm font-medium text-slate-200">
							Password
						</p>

						<p className="mt-1 text-sm text-slate-400">
							বর্তমান পাসওয়ার্ড অপরিবর্তিত থাকবে।
						</p>

						<p className="mt-2 text-xs leading-5 text-slate-500">
							ফোন নম্বর পরিবর্তন করলেও পাসওয়ার্ড পরিবর্তন হবে না।
							পাসওয়ার্ড পরিবর্তনের জন্য আলাদা ব্যবস্থা ব্যবহার
							করুন।
						</p>
					</div>
				</div>

				{/* Address Information */}
				<div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
					<div className="mb-5 flex items-center gap-2 border-b border-slate-800 pb-4">
						<MapPin size={19} className="text-[#4d9a70]" />
						<h2 className="font-semibold text-slate-100">
							Address Information
						</h2>
						<span className="text-xs text-slate-500">
							(Optional)
						</span>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label htmlFor="area" className={labelClass}>
								Area / এলাকা
							</label>
							<input
								id="area"
								type="text"
								value={form.area}
								onChange={(e) =>
									updateField('area', e.target.value)
								}
								placeholder="এলাকার নাম"
								maxLength={150}
								disabled={saving}
								className={inputClass}
							/>
						</div>

						<div>
							<label htmlFor="thana" className={labelClass}>
								Thana / উপজেলা
							</label>
							<input
								id="thana"
								type="text"
								value={form.thana}
								onChange={(e) =>
									updateField('thana', e.target.value)
								}
								placeholder="থানা বা উপজেলার নাম"
								maxLength={150}
								disabled={saving}
								className={inputClass}
							/>
						</div>

						<div className="sm:col-span-2">
							<label htmlFor="city" className={labelClass}>
								City / জেলা
							</label>
							<input
								id="city"
								type="text"
								value={form.city}
								onChange={(e) =>
									updateField('city', e.target.value)
								}
								placeholder="জেলার নাম"
								maxLength={150}
								disabled={saving}
								className={inputClass}
							/>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
					<Link
						href="/dashboard/customers"
						className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800">
						Cancel
					</Link>

					<button
						type="submit"
						disabled={saving}
						className="flex items-center justify-center gap-2 rounded-lg bg-[#1f5d3b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#194b30] disabled:cursor-not-allowed disabled:opacity-60">
						{saving ? (
							<>
								<Loader2 size={17} className="animate-spin" />
								Saving Changes...
							</>
						) : (
							<>
								<Save size={17} />
								Update Customer
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
