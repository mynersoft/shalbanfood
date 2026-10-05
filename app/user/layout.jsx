'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { setSidebar } from '@/redux/store/slices/uiSlice';
import UserHeader from '@/components/user/UserHeader';
import UserSidebar from '@/components/user/UserSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

const Layout = ({ children }) => {
	const dispatch = useDispatch();

	const { sidebarOpen } = useSelector((state) => state.ui);

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

	/* ================= Not Logged In ================= */

	return (
		<AuthGuard>
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
		</AuthGuard>
	);
};

export default Layout;
