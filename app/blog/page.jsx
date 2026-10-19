
import Link from "next/link";
import { connectDB } from "@/lib/dbConnect";
import Blog from "@/models/Blog";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.shalbanfood.shop"
).replace(/\/+$/, "");

const SITE_NAME = "Shalban Food";

export const metadata = {
  title: "মধু, ঘি ও প্রাকৃতিক খাবারের ব্লগ | Shalban Food",
  description:
    "খাঁটি মধু, গাওয়া ঘি, সুন্দরবনের মধু, খাদ্য সংরক্ষণ ও প্রাকৃতিক খাবার সম্পর্কে প্রয়োজনীয় তথ্য পড়ুন Shalban Food Blog-এ।",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Shalban Food Blog | মধু, ঘি ও প্রাকৃতিক খাবার",
    description:
      "মধু, ঘি ও প্রাকৃতিক খাবার সম্পর্কে জানুন সহজ ভাষায়।",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: "bn_BD",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getBlogs() {
  try {
    await connectDB();

    const blogs = await Blog.find({
      status: "published",
    })
      .select(
        "title slug excerpt featuredImage featuredImageAlt category author publishedAt createdAt"
      )
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()
      .exec();

    return blogs.map((blog) => ({
      ...blog,
      _id: String(blog._id),
      slug: String(blog.slug),
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      featuredImage: blog.featuredImage || "",
      featuredImageAlt: blog.featuredImageAlt || blog.title || "",
      category: blog.category || "প্রাকৃতিক খাবার",
      author: blog.author || SITE_NAME,
      publishedAt: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : null,
    }));
  } catch (error) {
    console.error("Blog fetch error:", error);
    return [];
  }
}

function formatDate(date) {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(parsed);
}

function BlogCard({ blog, featured = false }) {
  const href = `/blog/${encodeURIComponent(blog.slug)}`;

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-stone-200/80 bg-white",
        "shadow-sm transition duration-300",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60",
        featured ? "md:grid md:grid-cols-2" : "",
      ].join(" ")}
    >
      <Link
        href={href}
        aria-label={`${blog.title} পড়ুন`}
        className={[
          "relative block overflow-hidden bg-stone-100",
          featured ? "min-h-[250px] md:min-h-[360px]" : "h-56",
        ].join(" ")}
      >
        {blog.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.featuredImage}
            alt={blog.featuredImageAlt}
            loading={featured ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-green-100">
            <div className="text-center">
              <span className="text-5xl" aria-hidden="true">
                🍯
              </span>
              <p className="mt-3 text-sm font-medium text-stone-600">
                Shalban Food
              </p>
            </div>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm">
          {blog.category}
        </span>
      </Link>

      <div
        className={[
          "flex flex-1 flex-col p-5 sm:p-6",
          featured ? "justify-center md:p-8 lg:p-10" : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          {formatDate(blog.publishedAt) && (
            <time dateTime={blog.publishedAt}>
              {formatDate(blog.publishedAt)}
            </time>
          )}

          <span aria-hidden="true">•</span>
          <span>{blog.author}</span>
        </div>

        <h2
          className={[
            "mt-3 font-bold leading-snug text-stone-900",
            "transition-colors group-hover:text-green-800",
            featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl",
          ].join(" ")}
        >
          <Link href={href}>{blog.title}</Link>
        </h2>

        {blog.excerpt && (
          <p
            className={[
              "mt-3 leading-7 text-stone-600",
              featured ? "line-clamp-4 text-base" : "line-clamp-3 text-sm",
            ].join(" ")}
          >
            {blog.excerpt}
          </p>
        )}

        <div className="mt-6 pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-2 font-semibold text-green-800 transition hover:gap-3"
          >
            বিস্তারিত পড়ুন
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  const [featuredBlog, ...otherBlogs] = blogs;

  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-[#fff8e9] via-white to-[#edf6ec]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-green-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-green-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              SHALBAN FOOD JOURNAL
            </span>

            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              খাবার সম্পর্কে জানুন,
              <span className="mt-2 block text-green-800">
                সচেতনভাবে বেছে নিন
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              মধু, গাওয়া ঘি, প্রাকৃতিক খাবার, সংরক্ষণ ও
              দৈনন্দিন ব্যবহার সম্পর্কে প্রয়োজনীয় তথ্য পড়ুন
              সহজ ভাষায়।
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-stone-600">
              <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">
                প্রাকৃতিক খাবার
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">
                মধু ও ঘি
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-4 py-2">
                খাদ্য ও পুষ্টি
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Blog listing */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-green-800">
              FROM OUR BLOG
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              সর্বশেষ আর্টিকেল
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              আপনার প্রয়োজনীয় তথ্য খুঁজে নিন।
            </p>
          </div>

          {blogs.length > 0 && (
            <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600">
              মোট {blogs.length.toLocaleString("bn-BD")} টি পোস্ট
            </span>
          )}
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-bold text-stone-900">
              এখনো কোনো ব্লগ প্রকাশিত হয়নি
            </h2>

            <p className="mx-auto mt-2 max-w-md leading-7 text-stone-600">
              নতুন আর্টিকেল প্রকাশিত হলে এখানে দেখতে পাবেন।
              পরে আবার ঘুরে আসুন।
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900"
            >
              পণ্য দেখুন
            </Link>
          </div>
        ) : (
          <>
            {/* Featured article */}
            <BlogCard blog={featuredBlog} featured />

            {/* Remaining articles */}
            {otherBlogs.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* WhatsApp CTA */}
      <section className="border-t border-green-100 bg-[#eef5eb]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative overflow-hidden rounded-3xl bg-green-950 px-6 py-10 text-center text-white sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-green-700/40 blur-3xl"
            />

            <div className="relative mx-auto max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-green-300">
                SHALBAN FOOD
              </p>

              <h2 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
                খাঁটি মধু ও গাওয়া ঘি সম্পর্কে জানতে চান?
              </h2>

              <p className="mt-4 leading-7 text-green-100/80">
                পণ্য, মূল্য ও অর্ডার সম্পর্কে জানতে সরাসরি
                আমাদের সঙ্গে যোগাযোগ করুন।
              </p>

              <a
                href="https://wa.me/8801603816721"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-green-950 transition hover:bg-green-50"
              >
                WhatsApp-এ যোগাযোগ করুন
                <span aria-hidden="true">↗</span>
              </a>

              <p className="mt-4 text-sm text-green-200">
                01603816721
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
