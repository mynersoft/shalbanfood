'use client';

import { usePathname } from 'next/navigation';

import Header from '@/components/Header/HeaderNew';
import Footer from '@/components/footer/Footer';

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
