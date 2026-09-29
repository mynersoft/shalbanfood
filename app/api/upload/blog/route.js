import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(request) {
	try {
		const contentType = request.headers.get('content-type') || '';

		if (!contentType.includes('multipart/form-data')) {
			return NextResponse.json(
				{
					success: false,
					message: 'Request must be multipart/form-data',
				},
				{ status: 400 }
			);
		}

		const formData = await request.formData();

		const file = formData.get('file');

		if (!file || typeof file === 'string') {
			return NextResponse.json(
				{
					success: false,
					message: 'Image file is required',
				},
				{ status: 400 }
			);
		}

		if (!file.type.startsWith('image/')) {
			return NextResponse.json(
				{
					success: false,
					message: 'Only image files are allowed',
				},
				{ status: 400 }
			);
		}

		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{
					success: false,
					message: 'Image size cannot exceed 5MB',
				},
				{ status: 400 }
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'shalbanfood/blog',
					resource_type: 'image',
				},
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				}
			);

			uploadStream.end(buffer);
		});

		return NextResponse.json({
			success: true,
			message: 'Image uploaded successfully',
			url: result.secure_url,
			public_id: result.public_id,
		});
	} catch (error) {
		console.error('Cloudinary upload error:', error);

		return NextResponse.json(
			{
				success: false,
				message: error.message || 'Image upload failed',
			},
			{ status: 500 }
		);
	}
}
