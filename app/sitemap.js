
import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";
import Blog from "@/models/Blog";

const SITE_URL = "https://www.shalbanfood.shop";

export const revalidate = 3600;

const STATIC_PAGES = [
  "",
  "/shop",
  "/category/honey",
  "/category/ghee",
  "/category/combo",
  "/blog",
  "/about-us",
  "/contact-us",
  "/privacy-policy",
  "/terms-conditions",
];

export default async function sitemap() {
  const now = new Date();

  const staticUrls = STATIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  try {
    await connectDB();

    // Active products from all categories
    const products = await Product.find({
      isActive: true,
    })
      .select("slug updatedAt")
      .lean();

    // Published blogs
    const blogs = await Blog.find({
      status: "published",
    })
      .select("slug updatedAt publishedAt")
      .lean();

    // Product detail URLs
    const productUrls = products
      .filter((product) => product.slug)
      .map((product) => ({
        // Adjust this path to match your actual product route.
        url: `${SITE_URL}/${product.slug}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : now,
      }));

    // Published blog URLs
    const blogUrls = blogs
      .filter((blog) => blog.slug)
      .map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.updatedAt
          ? new Date(blog.updatedAt)
          : blog.publishedAt
            ? new Date(blog.publishedAt)
            : now,
      }));

    // Avoid duplicate URLs
    const allUrls = [
      ...staticUrls,
      ...productUrls,
      ...blogUrls,
    ];

    return Array.from(
      new Map(
        allUrls.map((item) => [item.url, item])
      ).values()
    );
  } catch (error) {
    console.error("Sitemap generation error:", error);

    return staticUrls;
  }
}
