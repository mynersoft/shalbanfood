
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	LogIn,
	Loader2,
	AlertCircle,
} from 'lucide-react';

import { toast } from 'react-hot-toast';

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	/*
	 * Example:
	 * /auth/login?callbackUrl=/cart
	 * /auth/login?callbackUrl=/checkout
	 * /auth/login?callbackUrl=/dashboard
	 */
	const callbackUrl = searchParams.get('callbackUrl');

	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleLogin = async (e) => {
		e.preventDefault();

		setError('');

		const value = identifier.trim();

		// -----------------------------
		// Validation
		// -----------------------------

		if (!value) {
			setError('Email অথবা Phone Number দিন');
			return;
		}

		if (!password) {
			setError('Password দিন');
			return;
		}

		try {
			setLoading(true);

			const result = await signIn('credentials', {
				identifier: value,
				password,
				redirect: false,
			});

			// -----------------------------
			// Login failed
			// -----------------------------

			if (!result || result.error) {
				setError('Email/Phone অথবা Password সঠিক নয়');
				toast.error('Login failed');
				return;
			}

			// -----------------------------
			// Login successful
			// -----------------------------

			toast.success('Login successful!');

			/*
			 * Only allow internal URLs.
			 *
			 * Allowed:
			 * /cart
			 * /checkout
			 * /user
			 * /dashboard
			 *
			 * Blocked:
			 * https://example.com
			 * //example.com
			 */
			let redirectTo = '/user';

			if (
				callbackUrl &&
				callbackUrl.startsWith('/') &&
				!callbackUrl.startsWith('//')
			) {
				redirectTo = callbackUrl;
			}

			/*
			 * Wait for the session cookie to be available,
			 * then redirect to the original page.
			 */
			router.replace(redirectTo);
			router.refresh();
		} catch (err) {
			console.error('LOGIN ERROR:', err);

			setError('Login করতে সমস্যা হয়েছে');
			toast.error('Login failed');
		} finally {
			setLoading(false);
		}
	};

	const isPhone =
		identifier.length > 0 &&
		!identifier.includes('@');

	return (
		<main className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md">

				{/* Brand */}

				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 text-white mb-4">
						<LogIn size={30} />
					</div>

					<h1 className="text-3xl font-bold text-gray-900">
						Shalban Food
					</h1>

					<p className="text-gray-500 mt-2">
						আপনার Account-এ Login করুন
					</p>
				</div>

				{/* Login Card */}

				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">

					<form
						onSubmit={handleLogin}
						className="space-y-5"
					>

						{/* Email / Phone */}

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email অথবা Phone Number
							</label>

							<div className="relative">
								{isPhone ? (
									<Phone
										size={19}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
									/>
								) : (
									<Mail
										size={19}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
									/>
								)}

								<input
									type="text"
									value={identifier}
									onChange={(e) => {
										setIdentifier(
											e.target.value
										);
										setError('');
									}}
									placeholder="Email অথবা 01XXXXXXXXX"
									autoComplete="username"
									disabled={loading}
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
								/>
							</div>
						</div>

						{/* Password */}

						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-medium text-gray-700">
									Password
								</label>

								<Link
									href="/auth/forgot-password"
									className="text-sm text-green-600 hover:text-green-700"
								>
									Forgot Password?
								</Link>
							</div>

							<div className="relative">
								<Lock
									size={19}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>

								<input
									type={
										showPassword
											? 'text'
											: 'password'
									}
									value={password}
									onChange={(e) => {
										setPassword(
											e.target.value
										);
										setError('');
									}}
									placeholder="আপনার Password"
									autoComplete="current-password"
									disabled={loading}
									className="w-full h-12 rounded-xl border border-gray-300 pl-10 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
								/>

								<button
									type="button"
									disabled={loading}
									onClick={() =>
										setShowPassword(
											(prev) => !prev
										)
									}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
								>
									{showPassword ? (
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

						{/* Login Button */}

						<button
							type="submit"
							disabled={loading}
							className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold flex items-center justify-center gap-2 transition"
						>
							{loading ? (
								<>
									<Loader2
										size={20}
										className="animate-spin"
									/>
									Login হচ্ছে...
								</>
							) : (
								<>
									<LogIn size={20} />
									Login
								</>
							)}
						</button>
					</form>

					{/* Signup */}

					<div className="text-center mt-6 pt-6 border-t border-gray-100">
						<p className="text-sm text-gray-500">
							Shalban Food-এ নতুন?
						</p>

						<Link
							href="/auth/register"
							className="inline-block mt-1 text-green-600 hover:text-green-700 font-semibold"
						>
							Create Account
						</Link>
					</div>
				</div>

				<p className="text-center text-xs text-gray-400 mt-6">
					© {new Date().getFullYear()} Shalban Food
				</p>
			</div>
		</main>
	);
};
