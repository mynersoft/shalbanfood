import { connectDB } from './db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tomartbd.com';

  await connectDB();

  const products = await Product.find({ isActive: true }).select('slug updatedAt');
  const categories = await Category.find({ isActive: true }).select('slug updatedAt');

  const urls = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  products.forEach(p => {
    urls.push({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  categories.forEach(c => {
    urls.push({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return urls;
}