'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSidebar } from '@/redux/store/slices/uiSlice';
import UserHeader from '@/components/user/UserHeader';
import UserSidebar from '@/components/user/UserSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function UserLayout({ children }) {
	const dispatch = useDispatch();
	const { sidebarOpen } = useSelector((state) => state.ui);

	// Initialize sidebar according to viewport size.
	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 768px)');

		const syncSidebar = (event) => {
			dispatch(setSidebar(event.matches));
		};

		dispatch(setSidebar(mediaQuery.matches));

		mediaQuery.addEventListener('change', syncSidebar);

		return () => {
			mediaQuery.removeEventListener('change', syncSidebar);
		};
	}, [dispatch]);

	const closeMobileSidebar = () => {
		dispatch(setSidebar(false));
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-slate-50 text-slate-800">
				{/* Mobile backdrop */}
				{sidebarOpen && (
					<button
						type="button"
						aria-label="Close navigation"
						onClick={closeMobileSidebar}
						className="
                            fixed inset-0 z-40 bg-slate-950/40
                            backdrop-blur-[2px] md:hidden
                        "
					/>
				)}

				{/* Sidebar */}
				<aside
					className={`
                        fixed inset-y-0 left-0 z-50
                        transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        md:translate-x-0
                    `}>
					<UserSidebar />
				</aside>

				{/* Main area */}
				<div
					className={`
                        min-h-screen min-w-0
                        transition-[margin] duration-300 ease-in-out
                        ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                    `}>
					<UserHeader />

					<main className="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8">
						{children}
					</main>

					<footer className="px-4 pb-5 text-center text-xs text-slate-400 sm:px-6">
						© {new Date().getFullYear()} Shalban Food. All rights
						reserved.
					</footer>
				</div>
			</div>
		</AuthGuard>
	);
}
