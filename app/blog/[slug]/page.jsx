
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/dbConnect';
import Blog from '@/models/Blog';

const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.shalbanfood.shop'
).replace(/\/+$/, '');

const SITE_NAME = 'Shalban Food';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function absoluteUrl(path) {
    return new URL(path, `${SITE_URL}/`).toString();
}

function getBlogUrl(slug) {
    return absoluteUrl(`/blog/${encodeURIComponent(slug)}`);
}

function getCanonicalUrl(blog) {
    const fallback = getBlogUrl(blog.slug);

    if (!blog.canonicalUrl?.trim()) {
        return fallback;
    }

    try {
        const url = new URL(blog.canonicalUrl);

        if (url.protocol === 'https:' || url.protocol === 'http:') {
            return url.toString();
        }
    } catch {
        // Fall back to the current blog URL.
    }

    return fallback;
}

function safeJsonLd(data) {
    return JSON.stringify(data).replace(/</g, '\\u003c');
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

/*
|--------------------------------------------------------------------------
| Fetch published blog
|--------------------------------------------------------------------------
| React cache avoids duplicate DB queries between generateMetadata()
| and the page render for the same slug within a request.
*/

const getBlog = cache(async (slug) => {
    if (!slug || typeof slug !== 'string') {
        return null;
    }

    await connectDB();

    const blog = await Blog.findOne({
        slug,
        status: 'published',
    })
        .lean()
        .exec();

    if (!blog) {
        return null;
    }

    return JSON.parse(JSON.stringify(blog));
});

/*
|--------------------------------------------------------------------------
| SEO Metadata
|--------------------------------------------------------------------------
*/

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const blog = await getBlog(slug);

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

    const uniqueKeywords = [...new Set(
        keywords.filter(
            (item) => typeof item === 'string' && item.trim()
        )
    )];

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
            locale: 'bn_BD',
            type: 'article',

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

            ...(publishedTime && {
                publishedTime,
            }),

            ...(modifiedTime && {
                modifiedTime,
            }),

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
                ? 'summary_large_image'
                : 'summary',
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
                'max-image-preview': 'large',
                'max-snippet': -1,
                'max-video-preview': -1,
            },
        },
    };
}

/*
|--------------------------------------------------------------------------
| Blog Details Page
|--------------------------------------------------------------------------
*/

export default async function BlogDetailsPage({ params }) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        notFound();
    }

    const canonical = getCanonicalUrl(blog);
    const description = getDescription(blog);
    const publishedTime = getIsoDate(blog.publishedAt);
    const modifiedTime = getIsoDate(blog.updatedAt);
    const imageAlt = getImageAlt(blog);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',

        headline: blog.title,
        description,

        inLanguage: 'bn-BD',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonical,
        },

        url: canonical,

        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },

        author: {
            '@type': 'Organization',
            name: blog.author || SITE_NAME,
            url: SITE_URL,
        },

        ...(blog.category && {
            articleSection: blog.category,
        }),

        ...(Array.isArray(blog.keywords) &&
            blog.keywords.length > 0 && {
                keywords: blog.keywords.join(', '),
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

    const formattedDate = blog.publishedAt
        ? new Intl.DateTimeFormat('bn-BD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Asia/Dhaka',
          }).format(new Date(blog.publishedAt))
        : null;

    return (
        <main className="min-h-screen bg-white text-gray-900">
            <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Article header */}
                <header className="mb-8">
                    {blog.category && (
                        <div className="mb-3 text-sm font-medium text-green-700">
                            {blog.category}
                        </div>
                    )}

                    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                        {blog.title}
                    </h1>

                    {blog.excerpt && (
                        <p className="mt-5 text-lg leading-8 text-gray-600">
                            {blog.excerpt}
                        </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
                        <span>
                            লেখক: {blog.author || SITE_NAME}
                        </span>

                        {formattedDate && (
                            <>
                                <span aria-hidden="true">·</span>
                                <time
                                    dateTime={publishedTime}
                                >
                                    {formattedDate}
                                </time>
                            </>
                        )}
                    </div>
                </header>

                {/* Featured image */}
                {blog.featuredImage && (
                    <figure className="mb-8 overflow-hidden rounded-2xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={blog.featuredImage}
                            alt={imageAlt}
                            width="1200"
                            height="630"
                            fetchPriority="high"
                            className="h-auto max-h-[600px] w-full object-cover"
                        />
                    </figure>
                )}

                {/* Article content */}
                <div
                    className={[
                        'prose prose-lg max-w-none',
                        'prose-headings:font-bold',
                        'prose-headings:text-gray-900',
                        'prose-a:text-green-700',
                        'prose-img:rounded-xl',
                        'prose-li:leading-8',
                    ].join(' ')}
                    dangerouslySetInnerHTML={{
                        __html: blog.content,
                    }}
                />

                {/* Tags */}
                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                    <footer className="mt-10 border-t border-gray-200 pt-6">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">
                            বিষয়সমূহ
                        </h2>

                        <ul className="flex flex-wrap gap-2">
                            {blog.tags.map((tag) => (
                                <li key={tag}>
                                    <span className="inline-block rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-800">
                                        {tag}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </footer>
                )}

                {/* Structured data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: safeJsonLd(articleSchema),
                    }}
                />
            </article>
        </main>
    );
}
