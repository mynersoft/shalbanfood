'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useDispatch } from 'react-redux';

import {
	setBlogs,
	addBlog,
	updateBlog,
	deleteBlog,
} from '../store/slices/blogSlice';

async function fetchBlogs({ status = '', search = '', page = 1, limit = 10 }) {
	const params = new URLSearchParams();

	if (status) params.set('status', status);
	if (search) params.set('search', search);

	params.set('page', page);
	params.set('limit', limit);

	const response = await fetch(`/api/blogs?${params.toString()}`, {
		cache: 'no-store',
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Failed to fetch blogs');
	}

	return data;
}

export function useBlogs(options = {}) {
	const dispatch = useDispatch();

	return useQuery({
		queryKey: ['blogs', options],

		queryFn: async () => {
			const result = await fetchBlogs(options);

			dispatch(setBlogs(result.data));

			return result;
		},

		staleTime: 60 * 1000,
	});
}

export function useBlog(id) {
	return useQuery({
		queryKey: ['blog', id],

		queryFn: async () => {
			const response = await fetch(`/api/blogs/${id}`);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Blog not found');
			}

			return data.data;
		},

		enabled: !!id,
	});
}

export function useCreateBlog() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (blogData) => {
			const response = await fetch('/api/blogs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(blogData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to create blog');
			}

			return data.data;
		},

		onSuccess: (blog) => {
			dispatch(addBlog(blog));

			queryClient.invalidateQueries({
				queryKey: ['blogs'],
			});
		},
	});
}

export function useUpdateBlog() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async ({ id, data }) => {
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Failed to update blog');
			}

			return result.data;
		},

		onSuccess: (blog) => {
			dispatch(updateBlog(blog));

			queryClient.invalidateQueries({
				queryKey: ['blogs'],
			});

			queryClient.invalidateQueries({
				queryKey: ['blog', blog._id],
			});
		},
	});
}

export function useDeleteBlog() {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	return useMutation({
		mutationFn: async (id) => {
			const response = await fetch(`/api/blogs/${id}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to delete blog');
			}

			return id;
		},

		onSuccess: (id) => {
			dispatch(deleteBlog(id));

			queryClient.invalidateQueries({
				queryKey: ['blogs'],
			});
		},
	});
}
