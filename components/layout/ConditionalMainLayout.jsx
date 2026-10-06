'use client';

import { usePathname } from 'next/navigation';

import Header from '@/components/header/HeaderNew';
import Footer from '@/components/footer/Footer';

export default function ConditionalMainLayout({ children }) {
	const pathname = usePathname();

	const hideLayout =
		pathname?.startsWith('/dashboard') || pathname?.startsWith('/user');

	return (
		<>
			{!hideLayout && <Header />}

			{children}

			{!hideLayout && <Footer />}
		</>
	);
}
