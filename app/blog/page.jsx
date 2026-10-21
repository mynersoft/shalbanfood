
import Link from "next/link";
import { connectDB } from "@/lib/dbConnect";
import Blog from "@/models/Blog";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.shalbanfood.shop"
).replace(/\/+$/, "");

const SITE_NAME = "Shalban Food";
const BLOG_URL = `${SITE_URL}/blog`;

export const revalidate = 300;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    absolute: "মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ | শালবন ফুড",
  },
  description:
    "মধু, সুন্দরবনের মধু, কালোজিরা ফুলের মধু, গাওয়া ঘি ও প্রাকৃতিক খাবার সম্পর্কে জানুন। খাদ্য নির্বাচন, সংরক্ষণ ও ব্যবহার নিয়ে পড়ুন শালবন ফুডের বাংলা ব্লগে।",
  keywords: [
    "মধু",
    "খাঁটি মধু",
    "সুন্দরবনের মধু",
    "কালোজিরা ফুলের মধু",
    "লিচু ফুলের মধু",
    "গাওয়া ঘি",
    "খাঁটি ঘি",
    "প্রাকৃতিক খাবার",
    "মধুর উপকারিতা",
    "মধু সংরক্ষণ",
    "Shalban Food",
    "শালবন ফুড",
  ],
  alternates: {
    canonical: BLOG_URL,
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: BLOG_URL,
    siteName: SITE_NAME,
    title: "মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ | শালবন ফুড",
    description:
      "মধু ও গাওয়া ঘি সম্পর্কে প্রয়োজনীয় তথ্য, ব্যবহারবিধি এবং প্রাকৃতিক খাবার নিয়ে বাংলা আর্টিকেল পড়ুন।",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Shalban Food — স্বাদের সাথে আস্থার বন্ধন",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "মধু ও গাওয়া ঘির বাংলা ব্লগ | Shalban Food",
    description:
      "প্রাকৃতিক খাবার, মধু ও গাওয়া ঘি সম্পর্কে জানুন সহজ বাংলায়।",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

async function getBlogs() {
  try {
    await connectDB();

    const blogs = await Blog.find({ status: "published" })
      .select(
        "title slug excerpt featuredImage featuredImageAlt category author publishedAt createdAt"
      )
      .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
      .lean()
      .exec();

    return blogs.map((blog) => ({
      _id: String(blog._id),
      title: blog.title || "",
      slug: String(blog.slug || ""),
      excerpt: blog.excerpt || "",
      featuredImage: blog.featuredImage || "",
      featuredImageAlt:
        blog.featuredImageAlt || blog.title || "Shalban Food article",
      category: blog.category || "প্রাকৃতিক খাবার",
      author: blog.author || SITE_NAME,
      publishedAt: blog.publishedAt
        ? new Date(blog.publishedAt).toISOString()
        : null,
      createdAt: blog.createdAt
        ? new Date(blog.createdAt).toISOString()
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
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(parsed);
}

function BlogImage({ blog, featured = false }) {
  if (!blog.featuredImage) {
    return (
      <div className="flex h-full min-h-52 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-green-100">
        <div className="text-center">
          <span className="text-6xl" aria-hidden="true">
            🍯
          </span>
          <p className="mt-3 font-semibold text-green-900">
            Shalban Food
          </p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={blog.featuredImage}
      alt={blog.featuredImageAlt}
      loading={featured ? "eager" : "lazy"}
      fetchPriority={featured ? "high" : "auto"}
      decoding="async"
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />
  );
}

function BlogCard({ blog, featured = false }) {
  const href = `/blog/${encodeURIComponent(blog.slug)}`;
  const date = formatDate(blog.publishedAt || blog.createdAt);

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-3xl",
        "border border-stone-200/80 bg-white",
        "shadow-[0_5px_25px_rgba(28,45,30,0.04)]",
        "transition duration-300 hover:-translate-y-1",
        "hover:shadow-[0_18px_45px_rgba(28,45,30,0.10)]",
        featured ? "md:grid md:grid-cols-2" : "",
      ].join(" ")}
    >
      <Link
        href={href}
        aria-label={`${blog.title} পড়ুন`}
        className={[
          "relative block overflow-hidden bg-stone-100",
          featured
            ? "aspect-[4/3] md:aspect-auto md:min-h-[390px]"
            : "aspect-[16/10]",
        ].join(" ")}
      >
        <BlogImage blog={blog} featured={featured} />

        <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-green-900 shadow-sm">
          {blog.category}
        </span>

        {featured && (
          <span className="absolute bottom-4 left-4 rounded-full bg-green-950/90 px-4 py-2 text-xs font-bold text-white backdrop-blur">
            নির্বাচিত আর্টিকেল
          </span>
        )}
      </Link>

      <div
        className={[
          "flex flex-1 flex-col p-5 sm:p-6",
          featured ? "justify-center md:p-8 lg:p-10" : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
          {date && (
            <time dateTime={blog.publishedAt || blog.createdAt}>
              {date}
            </time>
          )}
          <span aria-hidden="true">•</span>
          <span>{blog.author}</span>
        </div>

        <h2
          className={[
            "mt-4 font-extrabold leading-snug tracking-tight text-stone-900",
            "transition-colors group-hover:text-green-800",
            featured
              ? "text-2xl sm:text-3xl lg:text-4xl"
              : "text-xl",
          ].join(" ")}
        >
          <Link href={href}>{blog.title}</Link>
        </h2>

        {blog.excerpt && (
          <p
            className={[
              "mt-4 leading-8 text-stone-600",
              featured ? "line-clamp-4 text-base" : "line-clamp-3 text-sm",
            ].join(" ")}
          >
            {blog.excerpt}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={href}
            className="inline-flex items-center gap-2 font-bold text-green-800 transition-all hover:gap-3"
          >
            সম্পূর্ণ আর্টিকেল পড়ুন
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function getStructuredData(blogs) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "মধু, গাওয়া ঘি ও প্রাকৃতিক খাবারের ব্লগ",
    description:
      "মধু, গাওয়া ঘি এবং প্রাকৃতিক খাবার সম্পর্কে বাংলায় তথ্যবহুল আর্টিকেল।",
    url: BLOG_URL,
    inLanguage: "bn-BD",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: blogs.length,
      itemListElement: blogs.map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BLOG_URL}/${encodeURIComponent(blog.slug)}`,
        name: blog.title,
      })),
    },
  };

  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  const [featuredBlog, ...otherBlogs] = blogs;

  return (
    <main className="min-h-screen bg-[#faf9f5] text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getStructuredData(blogs),
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-green-100 bg-gradient-to-br from-[#f3f8ed] via-white to-[#fff4df]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-green-200/40 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-xs font-extrabold tracking-[0.15em] text-green-900 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-green-600" />
              SHALBAN FOOD JOURNAL
            </Link>

            <h1 className="mt-7 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              মধু, গাওয়া ঘি ও
              <span className="mt-2 block text-green-800">
                প্রাকৃতিক খাবারের জগৎ
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              খাবার সম্পর্কে জানুন, সচেতনভাবে বেছে নিন।
              মধু, গাওয়া ঘি, খাদ্য সংরক্ষণ ও দৈনন্দিন ব্যবহার
              নিয়ে পড়ুন সহজ বাংলায়।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                ["মধু সম্পর্কে জানুন", "/honey"],
                ["গাওয়া ঘি", "/ghee"],
                ["সব পণ্য দেখুন", "/shop"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-green-200 bg-white/90 px-5 py-3 text-sm font-bold text-green-900 shadow-sm transition hover:border-green-800 hover:bg-green-800 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-stone-500">
              <span>✓ সহজ বাংলা</span>
              <span>✓ ব্যবহারিক তথ্য</span>
              <span>✓ প্রাকৃতিক খাবার</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section
        aria-labelledby="blog-list-heading"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-green-800">
              KNOW WHAT YOU EAT
            </p>
            <h2
              id="blog-list-heading"
              className="mt-3 text-2xl font-black tracking-tight sm:text-3xl"
            >
              সর্বশেষ আর্টিকেল
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
              মধু ও ঘি সম্পর্কে জানুন এবং খাবার বাছাইয়ের আগে
              প্রয়োজনীয় তথ্য পড়ে নিন।
            </p>
          </div>

          {blogs.length > 0 && (
            <span className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600">
              {blogs.length.toLocaleString("bn-BD")} টি আর্টিকেল
            </span>
          )}
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
              📚
            </div>
            <h2 className="mt-5 text-xl font-extrabold">
              নতুন আর্টিকেল আসছে
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone-600">
              আমাদের প্রকাশিত আর্টিকেল এখানে দেখতে পাবেন।
              এর মধ্যে শালবন ফুডের পণ্যগুলো ঘুরে দেখুন।
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-green-800 px-6 py-3 font-bold text-white transition hover:bg-green-900"
            >
              পণ্য দেখুন
            </Link>
          </div>
        ) : (
          <>
            <BlogCard blog={featuredBlog} featured />

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

      {/* Brand CTA */}
      <section className="border-t border-green-100 bg-[#eef4e9] px-4 py-12 sm:px-6 sm:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-green-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-600/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-extrabold tracking-[0.2em] text-green-300">
              SHALBAN FOOD
            </p>
            <h2 className="mt-4 text-2xl font-black leading-snug sm:text-3xl">
              স্বাদের সাথে আস্থার বন্ধন
            </h2>
            <p className="mt-4 text-sm leading-8 text-green-100/80 sm:text-base">
              খাঁটি মধু ও গাওয়া ঘি সম্পর্কে জানতে বা পণ্য ও
              অর্ডারসংক্রান্ত তথ্যের জন্য আমাদের সঙ্গে যোগাযোগ করুন।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-white px-6 py-3.5 font-extrabold text-green-950 transition hover:bg-green-50"
              >
                পণ্য দেখুন
              </Link>
              <a
                href="https://wa.me/8801603816721"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-400/50 bg-green-900 px-6 py-3.5 font-bold text-white transition hover:bg-green-800"
              >
                WhatsApp-এ যোগাযোগ
              </a>
            </div>

            <p className="mt-5 text-sm text-green-200">
              01603816721
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
