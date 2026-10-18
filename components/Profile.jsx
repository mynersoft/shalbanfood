'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast, Toaster } from 'react-hot-toast';
import {
	User,
	Mail,
	Phone,
	MapPin,
	Loader2,
	CheckCircle,
	Save,
	ShieldCheck,
} from 'lucide-react';

import { updateUser } from '@/redux/store/slices/authSlice';

const EMPTY_FORM = {
	name: '',
	email: '',
	phone: '',
	address: {
		area: '',
		thana: '',
		city: '',
	},
};

export default function Profile() {
	const dispatch = useDispatch();
	const { data: session, status } = useSession();

	const user = session?.user;

	const [formData, setFormData] = useState(EMPTY_FORM);

	// Fill form when session user becomes available
	useEffect(() => {
		if (!user) return;

		setFormData({
			name: user.name ?? '',
			email: user.email ?? '',
			phone: user.phone ?? '',
			address: {
				area: user.address?.area ?? '',
				thana: user.address?.thana ?? '',
				city: user.address?.city ?? '',
			},
		});
	}, [user, session]);

	// Update profile API
	const updateProfile = useMutation({
		mutationFn: async (data) => {
			const response = await fetch('/api/users/update-profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'প্রোফাইল আপডেট করা যায়নি।');
			}

			return result;
		},

		onSuccess: (result) => {
			const updatedUser = result.user;

			// Update Redux user data
			dispatch(updateUser(updatedUser));

			// Keep the form synchronized with saved database data
			setFormData({
				name: updatedUser.name ?? '',
				email: updatedUser.email ?? '',
				phone: updatedUser.phone ?? '',
				address: {
					area: updatedUser.address?.area ?? '',
					thana: updatedUser.address?.thana ?? '',
					city: updatedUser.address?.city ?? '',
				},
			});

			toast.success(result.message || 'প্রোফাইল আপডেট হয়েছে।');
		},

		onError: (error) => {
			toast.error(error.message || 'আবার চেষ্টা করুন।');
		},
	});

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	const handleAddressChange = (field, value) => {
		setFormData((previous) => ({
			...previous,
			address: {
				...previous.address,
				[field]: value,
			},
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		if (!user) {
			toast.error('প্রথমে লগইন করুন।');
			return;
		}

		updateProfile.mutate(formData);
	};

	if (status === 'loading') {
		return (
			<div className="flex min-h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="mx-auto mt-10 max-w-lg rounded-xl bg-white p-8 text-center shadow">
				<ShieldCheck className="mx-auto mb-3 h-10 w-10 text-gray-400" />
				<h2 className="text-xl font-semibold text-gray-800">
					লগইন প্রয়োজন
				</h2>
				<p className="mt-2 text-gray-600">
					প্রোফাইল দেখতে ও আপডেট করতে লগইন করুন।
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
			<Toaster position="top-right" />

			<div className="mx-auto max-w-4xl">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
						My Profile
					</h1>
					<p className="mt-2 text-sm text-gray-500">
						আপনার ব্যক্তিগত তথ্য ও ঠিকানা আপডেট করুন।
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Account summary */}
					<section className="rounded-2xl bg-white p-6 shadow-sm">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
								<User className="h-8 w-8 text-blue-600" />
							</div>

							<div className="min-w-0">
								<h2 className="truncate text-xl font-semibold text-gray-900">
									{user.name || 'User'}
								</h2>
								<p className="break-all text-sm text-gray-500">
									{user.email || user.phone || 'Account'}
								</p>
								<span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
									{user.role || 'user'}
								</span>
							</div>
						</div>
					</section>

					{/* Personal information */}
					<section className="rounded-2xl bg-white p-6 shadow-sm">
						<h2 className="mb-6 border-b border-gray-100 pb-4 text-lg font-semibold text-gray-900">
							Personal Information
						</h2>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
									<User className="h-4 w-4" />
									Full Name
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									maxLength={100}
									required
									autoComplete="name"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="আপনার পূর্ণ নাম"
								/>
							</div>

							<div>
								<label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
									<Mail className="h-4 w-4" />
									Email Address
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									autoComplete="email"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="example@email.com"
								/>
							</div>

							<div className="md:col-span-2">
								<label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
									<Phone className="h-4 w-4" />
									Phone Number
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									maxLength={20}
									autoComplete="tel"
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="01XXXXXXXXX"
								/>
							</div>
						</div>
					</section>

					{/* Address */}
					<section className="rounded-2xl bg-white p-6 shadow-sm">
						<h2 className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4 text-lg font-semibold text-gray-900">
							<MapPin className="h-5 w-5 text-blue-600" />
							Delivery Address
						</h2>

						<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div className="md:col-span-2">
								<label className="mb-2 block text-sm font-medium text-gray-700">
									এলাকা / গ্রাম / রোড
								</label>
								<input
									type="text"
									value={formData.address.area}
									onChange={(event) =>
										handleAddressChange(
											'area',
											event.target.value
										)
									}
									maxLength={150}
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="আপনার এলাকা"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700">
									থানা / উপজেলা
								</label>
								<input
									type="text"
									value={formData.address.thana}
									onChange={(event) =>
										handleAddressChange(
											'thana',
											event.target.value
										)
									}
									maxLength={150}
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="থানা বা উপজেলা"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-gray-700">
									শহর / জেলা
								</label>
								<input
									type="text"
									value={formData.address.city}
									onChange={(event) =>
										handleAddressChange(
											'city',
											event.target.value
										)
									}
									maxLength={150}
									className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
									placeholder="শহর বা জেলা"
								/>
							</div>
						</div>
					</section>

					{/* Save button */}
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={updateProfile.isPending}
							className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
							{updateProfile.isPending ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin" />
									Saving...
								</>
							) : (
								<>
									{updateProfile.isSuccess ? (
										<CheckCircle className="h-5 w-5" />
									) : (
										<Save className="h-5 w-5" />
									)}
									Save Changes
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
