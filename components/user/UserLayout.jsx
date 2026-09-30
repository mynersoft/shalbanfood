"use client";

import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";


export default function UserLayout({ children }) {
	return (
		<div className="min-h-screen flex bg-gray-100">
			{/* Sidebar */}
			<UserSidebar />

			{/* Main Content */}
			<div className="flex-1 flex flex-col">
				<UserHeader />

				<main className="flex-1 p-4">{children}</main>
			</div>
		</div>
	);
}
