
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";
import Blog from "@/models/Blog";

const SITE_URL = "https://www.shalbanfood.shop";

export const revalidate = 3600;

const staticPages = [
  {
    url: `${SITE_URL}/`,
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/shop`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/about-us`,
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/contact-us`,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${SITE_URL}/privacy-policy`,
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${SITE_URL}/terms-conditions`,
    changeFrequency: "yearly",
    priority: 0.4,
  },
];

export default async function sitemap() {
  try {
    await connectDB();

    // Only published products
    const products = await Product.find({
      status: "published",
      slug: { $exists: true, $ne: "" },
    })
      .select("slug updatedAt createdAt")
      .lean();

    // Only published blogs
    const blogs = await Blog.find({
      status: "published",
      slug: { $exists: true, $ne: "" },
    })
      .select("slug updatedAt publishedAt createdAt")
      .lean();

    const productPages = products.map((product) => ({
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt || product.createdAt || undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogPages = blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(blog.slug)}`,
      lastModified:
        blog.updatedAt || blog.publishedAt || blog.createdAt || undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...blogPages];
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    // Keep static pages available if database query fails
    return staticPages;
  }
}
