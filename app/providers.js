'use client';

import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/redux/store/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Providers({ children }) {

	  const [activeTab, setActiveTab] = useState('Home');
	const pathname = usePathname();


	const isAdmin = pathname.startsWith('/admin');
	const isSeller = pathname.startsWith('/seller');
	const isUser = pathname.startsWith('/user');

	// Routes where Header should be hidden
	const hideHeader =
		pathname.startsWith('/admin') ||
		pathname.startsWith('/seller') ||
		pathname.startsWith('/user');
	

	return (
		  <SessionProvider>
					<ReduxProvider store={store}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</ReduxProvider>
		  </SessionProvider>

	);
}
