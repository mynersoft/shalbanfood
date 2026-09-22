"use client";

import { useEffect, useState } from "react";

export default function InternetStatus() {
	const [online, setOnline] = useState(true);

	useEffect(() => {
		// Check initial state
		setOnline(navigator.onLine);

		// Event listeners
		const handleOnline = () => setOnline(true);
		const handleOffline = () => setOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	if (online) return null;

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm z-[9999]">
			⚠️ No Internet Connection
		</div>
	);
}