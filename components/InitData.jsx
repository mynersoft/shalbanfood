'use client';

import { useEffect } from 'react';

import { useSession } from 'next-auth/react';

export default function InitData() {
	const { data: session, status } = useSession();

	// 🔹 Visitor tracking
	useEffect(() => {
		fetch('/api/visitor', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				path: window.location.pathname,
			}),
		});
	}, []);

	return null;
}
