'use client';
import { usePathname } from 'next/navigation';
import Footer from '@/components/footer/Footer';
import Header from '@/components/Header/HeaderNew';

export default function ConditionalMainLayout({ children }) {
	const pathname = usePathname();

	const hideLayout =pathname?.startsWith('/dashboard');
	
	return (
		<>
			{!hideLayout && <Header />}
			{children}
			{!hideLayout && <Footer />}
		</>
	);
}
