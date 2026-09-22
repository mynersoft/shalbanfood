'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { initWishlistFromStorage } from '@/store/slices/wishlistSlice';
import { useWishlists } from '@/hooks/useWishlist';
import { useProducts } from '@/hooks/useDashboard';
import { useBlogs } from '@/hooks/useBlog';
import { useInitializeCart } from '@/hooks/useCart';
import { useStatCard } from '@/hooks/useStatCard';
import { useCombos } from '@/hooks/useCombo';
import { useCategories } from '@/hooks/useCategory';
import { useBrands } from '@/hooks/useBrands';
import { useShipping } from '@/hooks/useShipping';

export default function InitData() {
	const dispatch = useDispatch();
	const { data: session, status } = useSession();

	const isLoggedIn = !!session?.user;

	// 🔹 Init wishlist from localStorage (ONCE)
	useEffect(() => {
		dispatch(initWishlistFromStorage());
	}, [dispatch]);

	// 🔹 Fetch server wishlist (only if logged in)
	useWishlists(isLoggedIn);

	// 🔹 Merge guest wishlist → server after login
	useEffect(() => {
		if (!isLoggedIn) return;

		const local = JSON.parse(localStorage.getItem('wishlist')) || [];

		if (!local.length) return;

		axios
			.post('/api/wishlists/merge', {
				productIds: local.map((p) => p._id),
			})
			.then(() => {
				localStorage.removeItem('wishlist');
			});
	}, [isLoggedIn]);

	// 🔹 Other initial data
	useInitializeCart(session?.user?.id);
	useProducts();
	useBrands();
	useCategories();
	useCombos();
	useBlogs();
	useStatCard();
	useShipping();

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
