import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Blog from '../../../../models/Blog';

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

export async function GET(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		const blog = await Blog.findById(id).lean();

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
			data: blog,
		});
	} catch (error) {
		console.error('GET BLOG ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to fetch blog',
			},
			{ status: 500 }
		);
	}
}

export async function PUT(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;
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

		const blog = await Blog.findById(id);

		if (!blog) {
			return NextResponse.json(
				{
					success: false,
					message: 'Blog not found',
				},
				{ status: 404 }
			);
		}

		if (title !== undefined) {
			blog.title = title;
		}

		if (slug !== undefined && slug) {
			blog.slug = makeSlug(slug);
		}

		if (excerpt !== undefined) {
			blog.excerpt = excerpt;
		}

		if (content !== undefined) {
			blog.content = content;
		}

		if (featuredImage !== undefined) {
			blog.featuredImage = featuredImage;
		}

		if (category !== undefined) {
			blog.category = category;
		}

		if (Array.isArray(tags)) {
			blog.tags = tags;
		}

		if (author !== undefined) {
			blog.author = author;
		}

		if (seoTitle !== undefined) {
			blog.seoTitle = seoTitle;
		}

		if (seoDescription !== undefined) {
			blog.seoDescription = seoDescription;
		}

		if (Array.isArray(keywords)) {
			blog.keywords = keywords;
		}

		if (canonicalUrl !== undefined) {
			blog.canonicalUrl = canonicalUrl;
		}

		if (status !== undefined) {
			blog.status = status;

			if (status === 'published' && !blog.publishedAt) {
				blog.publishedAt = new Date();
			}

			if (status === 'draft') {
				blog.publishedAt = null;
			}
		}

		await blog.save();

		return NextResponse.json({
			success: true,
			message: 'Blog updated successfully',
			data: blog,
		});
	} catch (error) {
		console.error('UPDATE BLOG ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to update blog',
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(request, { params }) {
	try {
		await connectDB();

		const { id } = await params;

		const blog = await Blog.findByIdAndDelete(id);

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
			message: 'Blog deleted successfully',
		});
	} catch (error) {
		console.error('DELETE BLOG ERROR:', error);

		return NextResponse.json(
			{
				success: false,
				message: 'Failed to delete blog',
			},
			{ status: 500 }
		);
	}
}
