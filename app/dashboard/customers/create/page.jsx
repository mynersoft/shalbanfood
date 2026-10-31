'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import {
	ArrowLeft,
	UserPlus,
	User,
	Phone,
	MapPin,
	LockKeyhole,
	Loader2,
} from 'lucide-react';

const initialForm = {
	name: '',
	phone: '',
	area: '',
	thana: '',
	city: '',
};

export default function CreateCustomerPage() {
	const router = useRouter();

	const [form, setForm] = useState(initialForm);
	const [loading, setLoading] = useState(false);

	const updateField = (field, value) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const phone = form.phone.replace(/\s+/g, '').trim();

		if (!/^01[3-9]\d{8}$/.test(phone)) {
			toast.error('সঠিক ১১ ডিজিটের ফোন নম্বর দিন।');
			return;
		}

		try {
			setLoading(true);

			const res = await fetch('/api/customers', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: form.name.trim(),
					phone,
					address: {
						area: form.area.trim(),
						thana: form.thana.trim(),
						city: form.city.trim(),
					},
				}),
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.message || 'কাস্টমার তৈরি করা যায়নি।');
			}

			toast.success('কাস্টমার সফলভাবে তৈরি হয়েছে।');

			router.push('/dashboard/customers');
			router.refresh();
		} catch (error) {
			toast.error(error.message || 'কিছু একটা সমস্যা হয়েছে।');
		} finally {
			setLoading(false);
		}
	};

	const inputClass =
		'w-full rounded-lg border border-gray-600 bg-gray-950 px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1f5d3b] focus:ring-2 focus:ring-[#1f5d3b]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#4d9a70] dark:focus:ring-[#4d9a70]/20';

	const labelClass =
		'mb-1.5 block text-sm font-medium text-slate-100';

	return (
		<div className="mx-auto max-w-3xl space-y-5 pb-10">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link
					href="/dashboard/customers"
					className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-950 text-gray-300 transition">
					<ArrowLeft size={19} />
				</Link>
				<div>
					<h1 className="text-base font-semibold text-gray-100 dark:text-slate-100">
						Create Customer
					</h1>
					<p className="mt-1 text-sm text-gray-300 dark:text-slate-400">
						নতুন কাস্টমার অ্যাকাউন্ট তৈরি করুন।
					</p>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Customer Information */}
				<div className="rounded-xl border border-gray-600 bg-gray-950 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
					<div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
						<UserPlus
							size={19}
							className="text-[#4d9a70]"
						/>
						<h2 className="font-semibold text-gray-100">
							Customer Information
						</h2>
					</div>

					<div className="grid gap-5 sm:grid-cols-2">
						{/* Name */}
						<div className="sm:col-span-2 ">
							<label className={labelClass}>Customer Name</label>

							<div className="relative">
								<User
									size={17}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
								/>

								<input
									type="text"
									value={form.name}
									onChange={(e) =>
										updateField('name', e.target.value)
									}
									placeholder="কাস্টমারের নাম"
									maxLength={100}
									className={`${inputClass} pl-10`}
								/>
							</div>

							<p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
								নাম না দিলে ফোন নম্বরটি নাম হিসেবে ব্যবহার হবে।
							</p>
						</div>

						{/* Phone */}
						<div className="sm:col-span-2">
							<label className={labelClass}>Phone Number *</label>

							<div className="relative">
								<Phone
									size={17}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
								/>

								<input
									type="tel"
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
									className={`${inputClass} pl-10`}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Password Information */}
				<div className="rounded-xl border  p-5 border-slate-800 bg-slate-900 sm:p-6">
					<div className="mb-3 flex items-center gap-2">
						<LockKeyhole
							size={19}
							className="text-[#4d9a70]"
						/>
						<h2 className="font-semibold text-slate-100">
							Login Information
						</h2>
					</div>

					<div className="rounded-lg bg-gray-5 bg-slate-800">
						<p className="text-sm font-medium text-slate-200">
							Initial Password
						</p>

						<p className="mt-1 font-mono text-sm border border-slate-500 px-2 py-2 rounded text-slate-300">
							{form.phone || 'ফোন নম্বর দেওয়ার পর এখানে দেখাবে'}
						</p>

						<p className="mt-2 text-xs leading-5 text-slate-400">
							কাস্টমারের ফোন নম্বরই তার প্রাথমিক পাসওয়ার্ড হবে।
							লগইন করার পর তাকে পাসওয়ার্ড পরিবর্তন করতে বলবে।
						</p>
					</div>
				</div>

				{/* Address */}
				<div className="rounded-xl border border-gray-600 bg-gray-950 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
					<div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-slate-800">
						<MapPin
							size={19}
							className="text-[#4d9a70]"
						/>
						<h2 className="font-semibold text-slate-100">
							Address Information
						</h2>
						<span className="text-xs text-gray-400 dark:text-slate-500">
							(Optional)
						</span>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						{/* Area */}
						<div>
							<label className={labelClass}>Area / এলাকা</label>
							<input
								type="text"
								value={form.area}
								onChange={(e) =>
									updateField('area', e.target.value)
								}
								placeholder="এলাকার নাম"
								className={inputClass}
							/>
						</div>

						{/* Thana */}
						<div>
							<label className={labelClass}>Thana / উপজেলা</label>
							<input
								type="text"
								value={form.thana}
								onChange={(e) =>
									updateField('thana', e.target.value)
								}
								placeholder="থানা বা উপজেলার নাম"
								className={inputClass}
							/>
						</div>

						{/* City */}
						<div className="sm:col-span-2">
							<label className={labelClass}>City / জেলা</label>
							<input
								type="text"
								value={form.city}
								onChange={(e) =>
									updateField('city', e.target.value)
								}
								placeholder="জেলার নাম"
								className={inputClass}
							/>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
					<Link
						href="/dashboard/customers"
						className="rounded-lg border border-gray-600 bg-gray-950 px-5 py-3 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
						Cancel
					</Link>

					<button
						type="submit"
						disabled={loading}
						className="flex items-center justify-center gap-2 rounded-lg bg-[#1f5d3b] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#194b30] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#276b47] dark:hover:bg-[#327f55]">
						{loading ? (
							<>
								<Loader2 size={17} className="animate-spin" />
								Creating...
							</>
						) : (
							<>
								<UserPlus size={17} />
								Create Customer
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
