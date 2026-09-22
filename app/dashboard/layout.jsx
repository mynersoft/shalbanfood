import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
	return (
		<div className="min-h-screen bg-[#0f1117] text-white">
			<Sidebar />

			<main className="min-h-screen md:ml-64">
				<div className="p-4 md:p-6 lg:p-8">{children}</div>
			</main>
		</div>
	);
}
