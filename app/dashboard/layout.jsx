'use client';

import React from 'react';
import Sidebar from '@/app/dashboard/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }) {
	return (
		<AuthGuard roles={['admin']}>
			<div className="min-h-screen bg-[#0f1117] text-white">
				<Sidebar />
				<main className="min-h-screen md:ml-64">
					<div className="p-4 md:p-6 lg:p-8">{children}</div>
				</main>
			</div>
		</AuthGuard>
	);
}
