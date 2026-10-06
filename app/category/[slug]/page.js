import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ChevronRight,
    Package,
    ShoppingBag,
} from "lucide-react";

import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/Product";

import ProductCard from "@/components/products/ProductCard";

const SITE_URL = "https://shalbanfood.vercel.app";

const categoryNames = {
    honey: "মধু",
    ghee: "গাওয়া ঘি",
    dates: "খেজুর",
    dry_foods: "শুকনা খাবার",
    nuts: "নাটস",
    spices: "মসলা",
};

function getCategoryName(slug) {
    return (
        categoryNames[slug] ||
        slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    );
}

function getCategoryDescription(slug, name) {
    const descriptions = {
        dates: `শালবন ফুডের ${name} সংগ্রহ। বাছাই করা খেজুরের বিভিন্ন পণ্য ও প্যাকেজ একসাথে দেখুন।`,
        honey: `শালবন ফুডের বিভিন্ন ফুলের প্রাকৃতিক মধু দেখুন।`,
        ghee: `শালবন ফুডের খাঁটি গাওয়া ঘি-এর বিভিন্ন প্যাকেজ দেখুন।`,
        "dry-foods": `শালবন ফুডের বাছাই করা শুকনা খাবার ও প্রাকৃতিক খাদ্যপণ্য দেখুন।`,
    };

    return (
        descriptions[slug] ||
        `${name} - শালবন ফুডের বাছাই করা খাদ্যপণ্য।`
    );
}

/* -------------------------------------------------------
   SEO
------------------------------------------------------- */

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const categoryName = getCategoryName(slug);
    const description = getCategoryDescription(
        slug,
        categoryName
    );

    const canonicalUrl = `${SITE_URL}/category/${slug}`;

    return {
        title: `${categoryName} | শালবন ফুড`,
        description,

        keywords: [
            categoryName,
            `${categoryName} বাংলাদেশ`,
            `${categoryName} কিনুন`,
            `শালবন ফুড ${categoryName}`,
            "Shalban Food",
            "অনলাইন ফুড শপ",
        ],

        alternates: {
            canonical: canonicalUrl,
        },

        openGraph: {
            title: `${categoryName} | শালবন ফুড`,
            description,
            url: canonicalUrl,
            siteName: "Shalban Food",
            locale: "bn_BD",
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title: `${categoryName} | শালবন ফুড`,
            description,
        },

        robots: {
            index: true,
            follow: true,
        },
    };
}

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default async function CategoryPage({ params }) {
    const { slug } = await params;

    await connectDB();

    /*
     * তোমার existing Product schema অনুযায়ী
     *
     * category: String
     *
     * তাই category slug সরাসরি category field-এর
     * সাথে match করা হচ্ছে।
     */
    const products = await Product.find({
        category: slug,
    })
        .sort({
            createdAt: -1,
        })
        .lean();

    /*
     * Category-তে কোনো product না থাকলে 404
     */
    if (!products.length) {
        notFound();
    }

    const categoryName = getCategoryName(slug);
    const description = getCategoryDescription(
        slug,
        categoryName
    );

    const canonicalUrl = `${SITE_URL}/category/${slug}`;

    /*
     * Product data JSON-safe করার জন্য
     */
    const safeProducts = products.map((product) => ({
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
    }));

    /* ---------------------------------------------------
       ItemList Schema
    --------------------------------------------------- */

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${categoryName} - শালবন ফুড`,
        description,
        url: canonicalUrl,
        numberOfItems: safeProducts.length,

        itemListElement: safeProducts.map(
            (product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${SITE_URL}/product/${product._id}`,
                name: product.name,
            })
        ),
    };

    /* ---------------------------------------------------
       Breadcrumb Schema
    --------------------------------------------------- */

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",

        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "হোম",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: categoryName,
                item: canonicalUrl,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-white">
            {/* Structured Data */}

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbSchema
                    ),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        itemListSchema
                    ),
                }}
            />

            {/* ------------------------------------------------
                Breadcrumb
            ------------------------------------------------ */}

            <section className="border-b border-gray-100 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-1.5 text-sm"
                    >
                        <Link
                            href="/"
                            className="text-gray-500 transition hover:text-green-600"
                        >
                            হোম
                        </Link>

                        <ChevronRight
                            size={15}
                            className="text-gray-400"
                        />

                        <span
                            className="font-medium text-gray-900"
                            aria-current="page"
                        >
                            {categoryName}
                        </span>
                    </nav>
                </div>
            </section>

            {/* ------------------------------------------------
                Category Header
            ------------------------------------------------ */}

            <section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
                            <ShoppingBag size={17} />
                            <span>Shalban Food Collection</span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {categoryName}
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                            {description}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                        <Package size={17} />

                        <span>
                            {safeProducts.length}টি পণ্য
                        </span>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------------
                Products
            ------------------------------------------------ */}

            <section
                className="mx-auto max-w-7xl px-4 py-8 sm:py-10"
                aria-labelledby="category-products"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2
                        id="category-products"
                        className="text-xl font-bold text-gray-900 sm:text-2xl"
                    >
                        {categoryName} এর পণ্য
                    </h2>

                    <span className="text-sm text-gray-500">
                        {safeProducts.length} Products
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                    {safeProducts.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}