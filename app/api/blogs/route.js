import { NextResponse } from 'next/server';
import {connectDB} from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export const runtime = 'nodejs';

function cleanArray(value) {
	if (!Array.isArray(value)) return [];

	return value.map((item) => String(item).trim()).filter(Boolean);
}

function slugify(text) {
	return String(text)
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

// GET /api/blogs
export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);

		const status = searchParams.get('status');
		const slug = searchParams.get('slug');

		if (slug) {
			const blog = await Blog.findOne({ slug }).lean();

			if (!blog) {
				return NextResponse.json(
					{
						success: false,
						message: 'Blog not found',
					},
					{ status: 404 }
				);
			}

			return NextResponse.json({
				success: true,
				blog,
			});
		}

		const filter = {};

		if (status === 'published' || status === 'draft') {
			filter.status = status;
		}

		const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();

		return NextResponse.json({
			success: true,
			count: blogs.length,
			blogs,
		});
	} catch (error) {
		console.error('GET /api/blogs error:', error);

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Failed to fetch blogs',
			},
			{ status: 500 }
		);
	}
}

// POST /api/blogs
export async function POST(request) {
	try {
		await connectDB();

		const body = await request.json();

		const {
			title,
			slug,
			excerpt,
			content,
			featuredImage,
			featuredImagePublicId,
			category,
			tags,
			author,
			seoTitle,
			seoDescription,
			keywords,
			canonicalUrl,
			status,
		} = body;

		if (!title?.trim()) {
			return NextResponse.json(
				{
					success: false,
					message: 'Blog title is required',
				},
				{ status: 400 }
			);
		}

		if (!content?.trim()) {
			return NextResponse.json(
				{
					success: false,
					message: 'Blog content is required',
				},
				{ status: 400 }
			);
		}

		const finalSlug = slugify(slug || title);

		if (!finalSlug) {
			return NextResponse.json(
				{
					success: false,
					message: 'Valid slug is required',
				},
				{ status: 400 }
			);
		}

		const existingBlog = await Blog.findOne({
			slug: finalSlug,
		});

		if (existingBlog) {
			return NextResponse.json(
				{
					success: false,
					message: 'A blog with this slug already exists',
				},
				{ status: 409 }
			);
		}

		const finalStatus = status === 'published' ? 'published' : 'draft';

		const blog = await Blog.create({
			title: title.trim(),
			slug: finalSlug,
			excerpt: excerpt?.trim() || '',
			content: content.trim(),
			featuredImage: featuredImage || '',
			featuredImagePublicId: featuredImagePublicId || '',
			category: category?.trim() || 'Food & Nutrition',
			tags: cleanArray(tags),
			author: author?.trim() || 'Shalban Food',
			seoTitle: seoTitle?.trim() || title.trim(),
			seoDescription: seoDescription?.trim() || excerpt?.trim() || '',
			keywords: cleanArray(keywords),
			canonicalUrl: canonicalUrl?.trim() || '',
			status: finalStatus,
			publishedAt: finalStatus === 'published' ? new Date() : null,
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Blog created successfully',
				blog,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('POST /api/blogs error:', error);

		if (error.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					message: 'Blog slug already exists',
				},
				{ status: 409 }
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Failed to create blog',
			},
			{ status: 500 }
		);
	}
}
