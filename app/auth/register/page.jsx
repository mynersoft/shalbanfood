'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	User,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	UserPlus,
	Loader2,
	CheckCircle2,
	AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
	const router = useRouter();

	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));

		setError('');
	};

	const handleRegister = async (e) => {
		e.preventDefault();

		setError('');

		const name = form.name.trim();
		const email = form.email.trim().toLowerCase();
		const phone = form.phone.trim();
		const password = form.password;
		const confirmPassword = form.confirmPassword;

		// Name
		if (!name) {
			setError('আপনার নাম দিন');
			return;
		}

		// Email OR Phone
		if (!email && !phone) {
			setError('Email অথবা Phone Number যেকোনো একটি দিন');
			return;
		}

		// Email validation
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (!emailRegex.test(email)) {
				setError('সঠিক Email Address দিন');
				return;
			}
		}

		// Phone validation
		if (phone) {
			const cleanPhone = phone.replace(/\s+/g, '');

			let normalizedPhone = cleanPhone;

			if (normalizedPhone.startsWith('+880')) {
				normalizedPhone = '0' + normalizedPhone.substring(4);
			}

			if (normalizedPhone.startsWith('880')) {
				normalizedPhone = '0' + normalizedPhone.substring(3);
			}

			const phoneRegex = /^01[3-9]\d{8}$/;

			if (!phoneRegex.test(normalizedPhone)) {
				setError('সঠিক বাংলাদেশি Phone Number দিন');
				return;
			}
		}

		// Password
		if (password.length < 8) {
			setError('Password কমপক্ষে ৮ অক্ষরের হতে হবে');
			return;
		}

		// Password uppercase
		if (!/[A-Z]/.test(password)) {
			setError('Password-এ অন্তত একটি বড় হাতের অক্ষর থাকতে হবে');
			return;
		}

		// Password lowercase
		if (!/[a-z]/.test(password)) {
			setError('Password-এ অন্তত একটি ছোট হাতের অক্ষর থাকতে হবে');
			return;
		}

		// Password number
		if (!/[0-9]/.test(password)) {
			setError('Password-এ অন্তত একটি সংখ্যা থাকতে হবে');
			return;
		}

		// Password special character
		if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password)) {
			setError('Password-এ অন্তত একটি special character থাকতে হবে');
			return;
		}

		// Confirm password
		if (password !== confirmPassword) {
			setError('Password দুটো একই নয়');
			return;
		}

		try {
			setLoading(true);

			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name,
					email: email || undefined,
					phone: phone || undefined,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Account তৈরি করা যায়নি');
			}

			toast.success('Account সফলভাবে তৈরি হয়েছে!');

			// Login page
			router.push('/auth/login');
		} catch (error) {
			console.error(error);

			setError(error.message || 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।');

			toast.error(error.message || 'Account তৈরি করা যায়নি');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md">
				{/* Brand */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 text-white mb-4">
						<UserPlus size={30} />
					</div>

					<h1 className="text-3xl font-bold text-gray-900">
						Shalban Food
					</h1>

					<p className="text-gray-500 mt-2">নতুন Account তৈরি করুন</p>
				</div>

				{/* Card */}
				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
					<form onSubmit={handleRegister} className="space-y-5">
						{/* Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								আপনার নাম
							</label>

							<div className="relative">
								<User
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type="text"
									name="name"
									value={form.name}
									onChange={handleChange}
									placeholder="আপনার নাম"
									autoComplete="name"
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
									disabled={loading}
								/>
							</div>
						</div>

						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
								<span className="text-gray-400 font-normal">
									{' '}
									(Optional)
								</span>
							</label>

							<div className="relative">
								<Mail
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									placeholder="example@gmail.com"
									autoComplete="email"
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
									disabled={loading}
								/>
							</div>
						</div>

						{/* OR */}
						<div className="relative flex items-center">
							<div className="flex-grow border-t border-gray-200" />

							<span className="mx-3 text-xs text-gray-400 bg-white px-2">
								অথবা
							</span>

							<div className="flex-grow border-t border-gray-200" />
						</div>

						{/* Phone */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
								<span className="text-gray-400 font-normal">
									{' '}
									(Optional)
								</span>
							</label>

							<div className="relative">
								<Phone
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type="tel"
									name="phone"
									value={form.phone}
									onChange={handleChange}
									placeholder="01XXXXXXXXX"
									autoComplete="tel"
									inputMode="tel"
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
									disabled={loading}
								/>
							</div>

							<p className="text-xs text-gray-400 mt-1.5">
								Email অথবা Phone — যেকোনো একটি দিলেই হবে
							</p>
						</div>

						{/* Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>

							<div className="relative">
								<Lock
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type={showPassword ? 'text' : 'password'}
									name="password"
									value={form.password}
									onChange={handleChange}
									placeholder="কমপক্ষে ৮ অক্ষর"
									autoComplete="new-password"
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
									disabled={loading}
								/>

								<button
									type="button"
									onClick={() =>
										setShowPassword((prev) => !prev)
									}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
									tabIndex={-1}>
									{showPassword ? (
										<EyeOff size={19} />
									) : (
										<Eye size={19} />
									)}
								</button>
							</div>

							<div className="mt-2 text-xs text-gray-500 space-y-1">
								<p className="flex items-center gap-1">
									<CheckCircle2 size={13} />
									কমপক্ষে ৮ অক্ষর
								</p>

								<p className="flex items-center gap-1">
									<CheckCircle2 size={13} />
									বড় ও ছোট হাতের অক্ষর
								</p>

								<p className="flex items-center gap-1">
									<CheckCircle2 size={13} />
									সংখ্যা ও special character
								</p>
							</div>
						</div>

						{/* Confirm Password */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>

							<div className="relative">
								<Lock
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type={
										showConfirmPassword
											? 'text'
											: 'password'
									}
									name="confirmPassword"
									value={form.confirmPassword}
									onChange={handleChange}
									placeholder="Password আবার দিন"
									autoComplete="new-password"
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
									disabled={loading}
								/>

								<button
									type="button"
									onClick={() =>
										setShowConfirmPassword((prev) => !prev)
									}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
									tabIndex={-1}>
									{showConfirmPassword ? (
										<EyeOff size={19} />
									) : (
										<Eye size={19} />
									)}
								</button>
							</div>
						</div>

						{/* Error */}
						{error && (
							<div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
								<AlertCircle
									size={18}
									className="shrink-0 mt-0.5"
								/>

								<span>{error}</span>
							</div>
						)}

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold flex items-center justify-center gap-2 transition">
							{loading ? (
								<>
									<Loader2
										size={20}
										className="animate-spin"
									/>
									Account তৈরি হচ্ছে...
								</>
							) : (
								<>
									<UserPlus size={20} />
									Create Account
								</>
							)}
						</button>
					</form>

					{/* Login */}
					<div className="text-center mt-6 pt-6 border-t border-gray-100">
						<p className="text-sm text-gray-500">
							আগে থেকেই Account আছে?
						</p>

						<Link
							href="/auth/login"
							className="inline-block mt-1 text-green-600 hover:text-green-700 font-semibold">
							Login করুন
						</Link>
					</div>
				</div>

				{/* Footer */}
				<p className="text-center text-xs text-gray-400 mt-6">
					© {new Date().getFullYear()} Shalban Food
				</p>
			</div>
		</main>
	);
}
