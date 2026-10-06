'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton({ className = '' }) {
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		try {
			setLoading(true);

			await signOut({
				callbackUrl: '/auth/login',
			});
		} catch (error) {
			console.error('Logout error:', error);

			setLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={loading}
			className={`flex w-full text-white items-center gap-3 rounded-xl px-3 py-2.5 text-md font-semibold transition   cursor-pointer ${className}`}>
			{loading ? (
				<Loader2 size={18} className="animate-spin" />
			) : (
				<LogOut size={18} />
			)}

			<span>{loading ? 'Logging out...' : 'Logout'}</span>
		</button>
	);
}
