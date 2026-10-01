'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import axios from 'axios';

import { useProducts } from '@/hooks/useProducts';
import { useBlogs } from '@/hooks/useBlog';
import { useCategories } from '@/hooks/useCategory';
import { useBrands } from '@/hooks/useBrands';
import { useShipping } from '@/hooks/useShipping';

export default function InitData() {
	const dispatch = useDispatch();
	const { data: session, status } = useSession();

	const isLoggedIn = !!session?.user;

	

	useProducts();
	useBrands();
	useCategories();
	useBlogs();
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
