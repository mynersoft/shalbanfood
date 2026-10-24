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
// /api/blogs?limit=3
// /api/blogs?page=2&limit=10 pagination
// /api/blogs?search=মধু search
// /api/blogs?category=Food%20%26%20Nutrition&tag=Honey

// /api/blogs?slug=sundarbans-honey  single blog

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_PAGE = 1_000_000;

const LIST_FIELDS = [
	'title',
	'slug',
	'excerpt',
	'featuredImage',
	'featuredImageAlt',
	'category',
	'tags',
	'author',
	'seoTitle',
	'seoDescription',
	'keywords',
	'canonicalUrl',
	'status',
	'publishedAt',
	'createdAt',
	'updatedAt',
].join(' ');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseInteger = (value, fallback, min, max) => {
	if (value === null || value === '') return fallback;

	const parsed = Number(value);

	if (!Number.isSafeInteger(parsed)) return fallback;

	return Math.min(max, Math.max(min, parsed));
};

const jsonError = (message, status = 500) =>
	NextResponse.json(
		{
			success: false,
			message,
		},
		{
			status,
			headers: {
				'Cache-Control': 'no-store',
			},
		}
	);

export async function GET(request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);

		// Pagination
		const page = parseInteger(searchParams.get('page'), 1, 1, MAX_PAGE);

		const limit = parseInteger(
			searchParams.get('limit'),
			DEFAULT_LIMIT,
			1,
			MAX_LIMIT
		);

		const skip = (page - 1) * limit;

		// Search
		const search = (
			searchParams.get('search') ||
			searchParams.get('q') ||
			''
		)
			.trim()
			.slice(0, 100);

		// Filters
		const category = (searchParams.get('category') || '')
			.trim()
			.slice(0, 100);

		const tag = (searchParams.get('tag') || '').trim().slice(0, 80);

		const slug = (searchParams.get('slug') || '').trim().slice(0, 200);

		// Whitelisted sorting
		const sortBy = searchParams.get('sortBy') || 'publishedAt';
		const order = searchParams.get('order') || 'desc';

		const allowedSortFields = [
			'publishedAt',
			'createdAt',
			'updatedAt',
			'title',
		];

		if (!allowedSortFields.includes(sortBy)) {
			return jsonError('Invalid sortBy parameter.', 400);
		}

		if (!['asc', 'desc'].includes(order)) {
			return jsonError('Invalid order parameter.', 400);
		}

		const sortOrder = order === 'asc' ? 1 : -1;

		const sort = {
			[sortBy]: sortOrder,
			_id: sortOrder,
		};

		// Public API: only published posts are accessible.
		// Never trust a client-supplied status parameter.
		const filter = {
			status: 'published',
		};

		if (search) {
			const regex = new RegExp(escapeRegex(search), 'i');

			filter.$or = [
				{ title: regex },
				{ excerpt: regex },
				{ category: regex },
				{ tags: regex },
				{ author: regex },
			];
		}

		if (category) {
			filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
		}

		if (tag) {
			filter.tags = new RegExp(`^${escapeRegex(tag)}$`, 'i');
		}

		// Single published article by slug.
		if (slug) {
			const post = await Blog.findOne({
				...filter,
				slug,
			})
				.select('+content')
				.lean();

			if (!post) {
				return jsonError('Blog post not found.', 404);
			}

			return NextResponse.json(
				{
					success: true,
					post,
				},
				{
					headers: {
						'Cache-Control':
							'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
					},
				}
			);
		}

		// Paginated blog listing.
		const [posts, total] = await Promise.all([
			Blog.find(filter)
				.select(LIST_FIELDS)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean(),

			Blog.countDocuments(filter),
		]);

		const totalPages = Math.ceil(total / limit);

		return NextResponse.json(
			{
				success: true,
				posts,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1 && total > 0,
					nextPage: page < totalPages ? page + 1 : null,
					prevPage: page > 1 && total > 0 ? page - 1 : null,
				},
				filters: {
					search,
					category,
					tag,
					sortBy,
					order,
				},
			},
			{
				headers: {
					'Cache-Control':
						'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
				},
			}
		);
	} catch (error) {
		console.error('GET /api/blogs error:', error);

		if (error instanceof mongoose.Error.ValidationError) {
			return jsonError('Invalid blog query.', 400);
		}

		return jsonError('Unable to fetch blog posts.');
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
