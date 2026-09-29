import Link from "next/link";
import { connectDB } from "@/lib/dbConnect";
import Blog from "@/models/Blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shalbanfood.com";

async function getBlogs() {
  try {
    await connectDB();

    const blogs = await Blog.find({
      status: "published",
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error("Blog fetch error:", error);
    return [];
  }
}

export const metadata = {
  title: "ব্লগ | Shalban Food",
  description:
    "মধু, ঘি, প্রাকৃতিক খাবার, সংরক্ষণ পদ্ধতি, ব্যবহার ও খাদ্য সম্পর্কিত তথ্য জানতে Shalban Food Blog পড়ুন।",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-700">
            Shalban Food Blog
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            খাবার ও প্রকৃতি নিয়ে জানুন
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            মধু, ঘি, প্রাকৃতিক খাবার, সংরক্ষণ, ব্যবহার এবং খাবার সম্পর্কে
            প্রয়োজনীয় তথ্য সহজ ভাষায় পড়ুন।
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        {blogs.length === 0 ? (
          <div className="rounded-2xl border bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              এখনো কোনো ব্লগ প্রকাশিত হয়নি
            </h2>

            <p className="mt-2 text-gray-500">
              নতুন পোস্ট খুব শিগগিরই প্রকাশিত হবে।
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {blog.coverImage && (
                  <Link href={`/blog/${blog.slug}`}>
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-52 w-full object-cover"
                    />
                  </Link>
                )}

                <div className="p-5">
                  {blog.category && (
                    <span className="text-xs font-semibold text-amber-700">
                      {blog.category}
                    </span>
                  )}

                  <h2 className="mt-2 text-xl font-bold leading-snug text-gray-900">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="hover:text-amber-700"
                    >
                      {blog.title}
                    </Link>
                  </h2>

                  {blog.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <time className="text-xs text-gray-500">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString(
                            "bn-BD",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </time>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                    >
                      পড়ুন →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* WhatsApp CTA */}
      <section className="border-t bg-amber-50">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Shalban Food-এর পণ্য সম্পর্কে জানতে চান?
          </h2>

          <p className="mt-2 text-gray-600">
            মধু, ঘি ও অন্যান্য পণ্য সম্পর্কে জানতে WhatsApp-এ যোগাযোগ করুন।
          </p>

          <a
            href="https://wa.me/8801603816721"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            WhatsApp: 01603816721
          </a>
        </div>
      </section>
    </main>
  );
}