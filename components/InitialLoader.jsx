'use client';

import { useEffect, useState } from 'react';

export default function InitialLoader({ children }) {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1200);

		return () => clearTimeout(timer);
	}, []);

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
				<div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return children;
}
