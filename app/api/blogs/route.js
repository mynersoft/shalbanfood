import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Blog from '../../../models/Blog';

export const runtime = 'nodejs';

function makeSlug(text) {
	return text
		.toString()
		.trim()
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);

		const status = searchParams.get('status');
		const search = searchParams.get('search');
		const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

		const limit = Math.min(
			Math.max(parseInt(searchParams.get('limit') || '10'), 1),
			50
		);

		const skip = (page - 1) * limit;

		const query = {};

		if (status) {
			query.status = status;
		}

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ excerpt: { $regex: search, $options: 'i' } },
				{ tags: { $regex: search, $options: 'i' } },
			];
		}

		const [blogs, total] = await Promise.all([
			Blog.find(query)
				.sort({
					publishedAt: -1,
					createdAt: -1,
				})
				.skip(skip)
				.limit(limit)
				.lean(),

			Blog.countDocuments(query),
		]);

		return NextResponse.json({
			success: true,
			data: blogs,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('GET BLOGS ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch blogs',
			},
			{ status: 500 }
		);
	}
}

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
			category,
			tags,
			author,
			seoTitle,
			seoDescription,
			keywords,
			canonicalUrl,
			status,
		} = body;

		if (!title || !content) {
			return NextResponse.json(
				{
					success: false,
					message: 'Title and content are required',
				},
				{ status: 400 }
			);
		}

		let finalSlug = slug ? makeSlug(slug) : makeSlug(title);

		const existing = await Blog.findOne({
			slug: finalSlug,
		});

		if (existing) {
			finalSlug = `${finalSlug}-${Date.now()}`;
		}

		const blog = await Blog.create({
			title,
			slug: finalSlug,
			excerpt: excerpt || '',
			content,
			featuredImage: featuredImage || '',
			category: category || 'Food & Nutrition',
			tags: Array.isArray(tags) ? tags : [],
			author: author || 'Shalban Food',
			seoTitle: seoTitle || title,
			seoDescription: seoDescription || excerpt || title,
			keywords: Array.isArray(keywords) ? keywords : [],
			canonicalUrl: canonicalUrl || '',
			status: status || 'draft',
			publishedAt: status === 'published' ? new Date() : null,
		});

		return NextResponse.json(
			{
				success: true,
				message: 'Blog created successfully',
				data: blog,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('CREATE BLOG ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to create blog',
			},
			{ status: 500 }
		);
	}
}
