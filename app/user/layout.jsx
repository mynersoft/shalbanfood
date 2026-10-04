'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { setSidebar } from '@/redux/store/slices/uiSlice';
import UserHeader from '@/components/user/UserHeader';
import UserSidebar from '@/components/user/UserSidebar';

const Layout = ({ children }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const { sidebarOpen } = useSelector((state) => state.ui);

	const { status } = useSession();

	/* ================= Authentication Guard ================= */

	useEffect(() => {
		if (status === 'unauthenticated') {
			toast.error('লগইন করুন', {
				id: 'user-login-required',
				duration: 2500,
			});

			const timer = setTimeout(() => {
				router.replace('/auth/login');
			}, 1200);

			return () => clearTimeout(timer);
		}
	}, [status, router]);

	/* ================= Sidebar ================= */

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				dispatch(setSidebar(false));
			} else {
				dispatch(setSidebar(true));
			}
		};

		handleResize();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [dispatch]);

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />

					<p className="text-sm text-slate-500">
						Account যাচাই করা হচ্ছে...
					</p>
				</div>
			</div>
		);
	}

	/* ================= Not Logged In ================= */

	if (status === 'unauthenticated') {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
				<div className="text-center">
					<div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
						<span className="text-2xl">🔐</span>
					</div>

					<h2 className="text-xl font-semibold text-slate-800">
						Login Required
					</h2>

					<p className="text-sm text-slate-500 mt-2">
						User Dashboard দেখতে প্রথমে Login করুন।
					</p>

					<button
						onClick={() => router.replace('/auth/login')}
						className="mt-5 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
						Login করুন
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* Sidebar */}

			<UserSidebar />

			{/* Main */}

			<main
				className={`
					flex-1 transition-all duration-300
					${sidebarOpen ? 'ml-64' : 'ml-20'}
				`}>
				<div className="p-6">
					<UserHeader />
					{children}
				</div>
			</main>
		</div>
	);
};

export default Layout;
