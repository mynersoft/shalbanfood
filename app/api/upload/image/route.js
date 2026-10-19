
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';

const FOLDERS = {
  product: 'shalbanfood/products',
  blog: 'shalbanfood/blog',
  combo: 'shalbanfood/offers',
  category: 'shalbanfood/categories',
  general: 'shalbanfood/general',
};

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

function clean(value, maxLength = 500) {
  return typeof value === 'string'
    ? value.trim().slice(0, maxLength)
    : '';
}

function makeSlug(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'shalban-image';
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, message: 'Multipart form data required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'Image file is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'JPEG, PNG, WebP অথবা AVIF ছবি ব্যবহার করুন',
        },
        { status: 415 }
      );
    }

    if (!file.size || file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'Image size must be between 1 byte and 10 MB',
        },
        { status: 400 }
      );
    }

    const type = clean(formData.get('type'), 30) || 'general';
    const folder = FOLDERS[type];

    if (!folder) {
      return NextResponse.json(
        { success: false, message: 'Invalid upload type' },
        { status: 400 }
      );
    }

    const title = clean(formData.get('title'), 250);
    const alt = clean(formData.get('alt'), 250);
    const caption = clean(formData.get('caption'), 500);
    const description = clean(formData.get('description'), 1000);

    const keywords = [
      ...new Set(
        clean(formData.get('keywords'), 1000)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ].slice(0, 20);

    if (!alt) {
      return NextResponse.json(
        { success: false, message: 'Image Alt Text is required' },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Validate file signatures instead of trusting MIME type alone.
    const isJpeg =
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;

    const isPng =
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );

    const isWebp =
      bytes.length >= 12 &&
      bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP';

    const isAvif =
      bytes.length >= 12 &&
      bytes.toString('ascii', 4, 8) === 'ftyp' &&
      ['avif', 'avis'].includes(bytes.toString('ascii', 8, 12));

    if (
      !(isJpeg || isPng || isWebp || isAvif) ||
      (file.type === 'image/jpeg' && !isJpeg) ||
      (file.type === 'image/png' && !isPng) ||
      (file.type === 'image/webp' && !isWebp) ||
      (file.type === 'image/avif' && !isAvif)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid image file' },
        { status: 415 }
      );
    }

    const publicId = makeSlug(title || file.name.replace(/\.[^.]+$/, ''));

    const context = {
      alt,
      ...(title && { title }),
      ...(caption && { caption }),
      ...(description && { description }),
    };

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          public_id: publicId,
          unique_filename: true,
          overwrite: false,
          context,
          tags: keywords,
          // No eager transformation: keep the uploaded original.
        },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded);
        }
      );

      stream.end(bytes);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Image uploaded successfully',
        image: {
          url: result.secure_url,
          publicId: result.public_id,
          alt,
          title,
          caption,
          description,
          keywords,
          fileName: file.name,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          isPrimary: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('IMAGE UPLOAD ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Image upload failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
