"use client";

import { HiBell } from "react-icons/hi";

export default function UserHeader() {
	return (
		<header className="h-16 bg-white shadow flex items-center justify-between px-6">
			<h1 className="text-lg font-semibold">User Dashboard</h1>

			<div className="flex items-center gap-4">
				<button className="relative">
					<HiBell className="w-6 h-6 text-gray-600" />
					<span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
				</button>

				<img
					src="/default-avatar.png"
					className="w-8 h-8 rounded-full"
					alt="user"
				/>
			</div>
		</header>
	);
}
