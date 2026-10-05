'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AuthGuard({ children, roles = [] }) {
	const router = useRouter();
	const pathname = usePathname();

	const { status, data: session } = useSession();

	const role = session?.user?.role;

	useEffect(() => {
		if (status === 'loading') return;

		if (status === 'unauthenticated') {
			const callbackUrl = encodeURIComponent(pathname);

			toast.error('Please login first', {
				id: 'login-required',
				duration: 2500,
			});

			const timer = setTimeout(() => {
				router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
			}, 700);

			return () => clearTimeout(timer);
		}

		// Role protection
		if (
			status === 'authenticated' &&
			roles.length > 0 &&
			!roles.includes(role)
		) {
			toast.error('You do not have permission', {
				id: 'permission-required',
				duration: 2500,
			});

			const timer = setTimeout(() => {
				router.replace('/');
			}, 700);

			return () => clearTimeout(timer);
		}
	}, [status, role, pathname, router, roles]);

	// Checking session
	if (status === 'loading') {
		return <AuthLoading />;
	}

	// Not authenticated
	if (status === 'unauthenticated') {
		return <AuthLoading text="Login page এ নেওয়া হচ্ছে..." />;
	}

	// Wrong role
	if (roles.length > 0 && !roles.includes(role)) {
		return <AuthLoading text="Permission যাচাই করা হচ্ছে..." />;
	}

	return children;
}

function AuthLoading({ text = 'Account যাচাই করা হচ্ছে...' }) {
	return (
		<div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />

				<p className="text-sm text-slate-400">{text}</p>
			</div>
		</div>
	);
}
