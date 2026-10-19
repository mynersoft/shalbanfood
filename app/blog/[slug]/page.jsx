
import { cache } from "react";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";

import { connectDB } from "@/lib/dbConnect";
import Blog from "@/models/Blog";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.shalbanfood.shop"
).replace(/\/+$/, "");

const SITE_NAME = "Shalban Food";

/* -------------------- URL helpers -------------------- */

function normalizeSlug(value) {
  if (typeof value !== "string") return "";

  let slug = value.trim();

  try {
    slug = decodeURIComponent(slug);
  } catch {
    // Keep the original value if malformed encoding is supplied.
  }

  return slug.trim().toLowerCase();
}

function absoluteUrl(path) {
  return new URL(path, `${SITE_URL}/`).toString();
}

function getBlogUrl(slug) {
  const safeSlug = normalizeSlug(slug);

  return absoluteUrl(
    `/blog/${encodeURIComponent(safeSlug)}`
  );
}

function getCanonicalUrl(blog) {
  const fallback = getBlogUrl(blog.slug);

  if (!blog.canonicalUrl?.trim()) return fallback;

  try {
    const url = new URL(blog.canonicalUrl);

    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname
    ) {
      return url.toString();
    }
  } catch {
    // Invalid canonical URL: use the blog's own URL.
  }

  return fallback;
}

/* -------------------- HTML rendering -------------------- */

// Keep article formatting while removing unsafe markup.
function sanitizeArticleContent(html) {
  return sanitizeHtml(html || "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "img",
      "figure",
      "figcaption",
      "iframe",
      "u",
      "s",
      "del",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "hr",
      "video",
      "source",
    ],

    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen"],
      video: ["src", "controls", "width", "height", "poster"],
      source: ["src", "type"],
      "*": ["class"],
    },

    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,

    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}

function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function getIsoDate(value) {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : date.toISOString();
}

function getDescription(blog) {
  return (
    blog.seoDescription?.trim() ||
    blog.excerpt?.trim() ||
    `${blog.title} — ${SITE_NAME}`
  );
}

function getImageAlt(blog) {
  return (
    blog.featuredImageAlt?.trim() ||
    blog.title ||
    `${SITE_NAME} blog image`
  );
}

/* -------------------- Database -------------------- */

const getBlog = cache(async (rawSlug) => {
  const slug = normalizeSlug(rawSlug);

  if (!slug) return null;

  await connectDB();

  const blog = await Blog.findOne({
    slug,
    status: "published",
  })
    .lean()
    .exec();

  if (!blog) return null;

  return JSON.parse(JSON.stringify(blog));
});

/* -------------------- SEO metadata -------------------- */

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const blog = await getBlog(rawSlug);

  if (!blog) {
    return {
      title: `Blog Not Found | ${SITE_NAME}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    blog.seoTitle?.trim() ||
    blog.title ||
    `${SITE_NAME} Blog`;

  const description = getDescription(blog);
  const canonical = getCanonicalUrl(blog);
  const publishedTime = getIsoDate(blog.publishedAt);
  const modifiedTime = getIsoDate(blog.updatedAt);
  const imageAlt = getImageAlt(blog);

  const keywords = [
    ...(Array.isArray(blog.keywords) ? blog.keywords : []),
    ...(Array.isArray(blog.tags) ? blog.tags : []),
  ];

  const uniqueKeywords = [
    ...new Set(
      keywords.filter(
        (item) => typeof item === "string" && item.trim()
      )
    ),
  ];

  return {
    title,
    description,
    ...(uniqueKeywords.length > 0 && {
      keywords: uniqueKeywords,
    }),

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "bn_BD",
      type: "article",

      ...(blog.featuredImage && {
        images: [
          {
            url: blog.featuredImage,
            width: 1200,
            height: 630,
            alt: imageAlt,
          },
        ],
      }),

      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),

      authors: [blog.author || SITE_NAME],

      ...(blog.category && {
        section: blog.category,
      }),

      ...(Array.isArray(blog.tags) &&
        blog.tags.length > 0 && {
          tags: blog.tags,
        }),
    },

    twitter: {
      card: blog.featuredImage
        ? "summary_large_image"
        : "summary",
      title,
      description,

      ...(blog.featuredImage && {
        images: [
          {
            url: blog.featuredImage,
            alt: imageAlt,
          },
        ],
      }),
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
}

/* -------------------- Blog details page -------------------- */

export default async function BlogDetailsPage({ params }) {
  const { slug: rawSlug } = await params;
  const blog = await getBlog(rawSlug);

  if (!blog) notFound();

  const canonical = getCanonicalUrl(blog);
  const description = getDescription(blog);
  const publishedTime = getIsoDate(blog.publishedAt);
  const modifiedTime = getIsoDate(blog.updatedAt);
  const imageAlt = getImageAlt(blog);

  const articleHtml = sanitizeArticleContent(blog.content);

  const formattedDate = blog.publishedAt
    ? new Intl.DateTimeFormat("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(new Date(blog.publishedAt))
    : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description,
    inLanguage: "bn-BD",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,

    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },

    author: {
      "@type": "Organization",
      name: blog.author || SITE_NAME,
      url: SITE_URL,
    },

    ...(blog.category && {
      articleSection: blog.category,
    }),

    ...(Array.isArray(blog.keywords) &&
      blog.keywords.length > 0 && {
        keywords: blog.keywords.join(", "),
      }),

    ...(publishedTime && {
      datePublished: publishedTime,
    }),

    ...(modifiedTime && {
      dateModified: modifiedTime,
    }),

    ...(blog.featuredImage && {
      image: [blog.featuredImage],
    }),
  };

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-gray-900">
      {/* Article hero */}
      <div className="border-b border-green-100 bg-gradient-to-b from-green-50 to-[#f7f8f5]">
        <article className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 text-sm text-gray-500"
          >
            <a
              href="/"
              className="transition hover:text-green-700"
            >
              হোম
            </a>

            <span className="mx-2">/</span>

            <a
              href="/blog"
              className="transition hover:text-green-700"
            >
              ব্লগ
            </a>

            <span className="mx-2">/</span>

            <span className="text-gray-700">
              {blog.title}
            </span>
          </nav>

          {blog.category && (
            <span className="inline-flex rounded-full border border-green-200 bg-white px-4 py-1.5 text-sm font-semibold text-green-800">
              {blog.category}
            </span>
          )}

          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-800 font-bold text-white">
              {(blog.author || SITE_NAME).slice(0, 1)}
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                {blog.author || SITE_NAME}
              </p>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-gray-500">
                {formattedDate && (
                  <time dateTime={publishedTime}>
                    {formattedDate}
                  </time>
                )}

                {formattedDate && <span>·</span>}

                <span>শালবন ফুড ব্লগ</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Featured image */}
        {blog.featuredImage && (
          <figure className="mb-9 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:mb-12 sm:rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.featuredImage}
              alt={imageAlt}
              width="1200"
              height="630"
              fetchPriority="high"
              className="max-h-[620px] w-full object-cover"
            />
          </figure>
        )}

        {/* HTML article content */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8 md:p-12">
          <div
            className={[
              "blog-content",
              "mx-auto max-w-3xl",
              "text-base leading-8 text-gray-700 sm:text-lg sm:leading-9",
              "[&_h1]:mb-5 [&_h1]:mt-10 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-gray-900",
              "[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:border-l-4 [&_h2]:border-green-700 [&_h2]:pl-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-gray-900",
              "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900",
              "[&_p]:mb-6 [&_p]:break-words",
              "[&_a]:font-medium [&_a]:text-green-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-green-900",
              "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-7",
              "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-7",
              "[&_li]:pl-1",
              "[&_strong]:font-bold [&_strong]:text-gray-900",
              "[&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-green-600 [&_blockquote]:bg-green-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:text-gray-700",
              "[&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl",
              "[&_figure]:my-8",
              "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-gray-500",
              "[&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
              "[&_th]:border [&_th]:border-gray-200 [&_th]:bg-green-50 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold",
              "[&_td]:border [&_td]:border-gray-200 [&_td]:p-3",
              "[&_hr]:my-10 [&_hr]:border-gray-200",
              "[&_iframe]:my-8 [&_iframe]:max-w-full",
              "[&_video]:my-8 [&_video]:max-w-full",
              "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-gray-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white",
              "[&_code]:break-words",
            ].join(" ")}
            dangerouslySetInnerHTML={{
              __html: articleHtml,
            }}
          />
        </div>

        {/* Tags */}
        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <footer className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
            <h2 className="mb-4 text-sm font-bold text-gray-800">
              এই আর্টিকেলের বিষয়
            </h2>

            <ul className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <li key={`${tag}-${index}`}>
                  <span className="inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-100">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </article>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(articleSchema),
        }}
      />
    </main>
  );
}
