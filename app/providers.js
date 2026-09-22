'use client';

import { Provider as ReduxProvider } from 'react-redux';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useInitializeCart } from '@/hooks/useCart';
import { store } from '@/redux/store/store';
import { queryClient } from '@/lib/queryClient';

function CartInitializer() {
	const { data: session, status } = useSession();
	const user = status === 'authenticated' ? session?.user : null;
	useInitializeCart(user);
	return null;
}

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
					<CartInitializer />
					{children}
				</QueryClientProvider>
			</ReduxProvider>
		</SessionProvider>
	);
}
