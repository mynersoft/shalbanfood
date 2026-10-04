'use client';

import { useSelector } from 'react-redux';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import ShopByCategory from '@/components/home/ShopByCategory';

export default function HomePage() {
    const { isLoading, isFetching } = useProducts();

    const products =
        useSelector((state) => state.product?.products) || [];

    return (
        <main className="min-h-screen bg-white">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="border-b border-gray-100 bg-[#f7faf8]">
                <div
                    className="
                        mx-auto
                        flex
                        max-w-7xl
                        flex-col
                        px-4
                        py-10
                        sm:py-14
                        md:flex-row
                        md:items-center
                        md:justify-between
                        md:gap-10
                        md:px-6
                        lg:px-8
                    "
                >
                    <div className="max-w-2xl">

                        <span
                            className="
                                inline-flex
                                rounded-full
                                bg-[#e8f4ed]
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                text-[#1f5d3b]
                            "
                        >
                            🌿 Natural & Quality Food
                        </span>

                        <h1
                            className="
                                mt-4
                                text-3xl
                                font-bold
                                leading-tight
                                tracking-tight
                                text-gray-900
                                sm:text-4xl
                                md:text-5xl
                            "
                        >
                            প্রাকৃতিক স্বাদ,
                            <br />
                            <span className="text-[#1f5d3b]">
                                আস্থার সাথে
                            </span>
                        </h1>

                        <p
                            className="
                                mt-4
                                max-w-xl
                                text-sm
                                leading-6
                                text-gray-600
                                sm:text-base
                            "
                        >
                            শালবন ফুডে পাবেন মানসম্মত মধু, ঘি
                            এবং বাছাই করা প্রাকৃতিক খাবার।
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">

                            <a
                                href="/shop"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#1f5d3b]
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#174a2f]
                                "
                            >
                                Shop Now
                            </a>

                            <a
                                href="/combo"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    transition
                                    hover:border-[#1f5d3b]
                                    hover:text-[#1f5d3b]
                                "
                            >
                                View Offers
                            </a>

                        </div>
                    </div>

                    {/* TRUST POINTS */}

                    <div
                        className="
                            mt-8
                            grid
                            grid-cols-3
                            gap-3
                            md:mt-0
                            md:min-w-[360px]
                        "
                    >
                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-4
                                text-center
                                shadow-sm
                            "
                        >
                            <div className="text-xl">🌿</div>
                            <p className="mt-2 text-xs font-semibold text-gray-800">
                                Natural
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                                Quality Food
                            </p>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-4
                                text-center
                                shadow-sm
                            "
                        >
                            <div className="text-xl">✓</div>
                            <p className="mt-2 text-xs font-semibold text-gray-800">
                                Trusted
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                                Product Quality
                            </p>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-4
                                text-center
                                shadow-sm
                            "
                        >
                            <div className="text-xl">📦</div>
                            <p className="mt-2 text-xs font-semibold text-gray-800">
                                Delivery
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                                Across Bangladesh
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
                SHOP BY CATEGORY
            ================================================= */}

            <section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10 md:px-6 lg:px-8">

                <ShopByCategory />

            </section>

            {/* =================================================
                LATEST PRODUCTS
            ================================================= */}

            <section
                className="
                    mx-auto
                    max-w-7xl
                    px-4
                    py-10
                    sm:py-12
                    md:px-6
                    lg:px-8
                "
            >

                {/* SECTION HEADER */}

                <div
                    className="
                        mb-6
                        flex
                        items-end
                        justify-between
                        gap-4
                    "
                >
                    <div>
                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-[#1f5d3b]
                            "
                        >
                            Fresh Picks
                        </p>

                        <h2
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                tracking-tight
                                text-gray-900
                                sm:text-3xl
                            "
                        >
                            Latest Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            আমাদের নতুন ও জনপ্রিয় পণ্যগুলো দেখুন।
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">

                        {isFetching && !isLoading && (
                            <span
                                className="
                                    hidden
                                    text-xs
                                    text-gray-400
                                    sm:block
                                "
                            >
                                Updating...
                            </span>
                        )}

                        <a
                            href="/shop"
                            className="
                                text-xs
                                font-semibold
                                text-[#1f5d3b]
                                transition
                                hover:underline
                                sm:text-sm
                            "
                        >
                            View All →
                        </a>

                    </div>
                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoading ? (
                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-3
                            lg:grid-cols-4
                        "
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-gray-100
                                        bg-white
                                    "
                                >
                                    <div className="aspect-square animate-pulse bg-gray-100" />

                                    <div className="space-y-3 p-3">
                                        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
                                        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-100" />
                                        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-100" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                ) : products.length === 0 ? (

                    /* =================================================
                        EMPTY
                    ================================================= */

                    <div
                        className="
                            rounded-2xl
                            border
                            border-dashed
                            border-gray-200
                            bg-gray-50
                            px-5
                            py-16
                            text-center
                        "
                    >
                        <div
                            className="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-2xl
                                shadow-sm
                            "
                        >
                            🛍️
                        </div>

                        <h3
                            className="
                                mt-4
                                font-semibold
                                text-gray-900
                            "
                        >
                            No products available
                        </h3>

                        <p
                            className="
                                mx-auto
                                mt-1
                                max-w-sm
                                text-sm
                                text-gray-500
                            "
                        >
                            নতুন পণ্য শীঘ্রই যুক্ত করা হবে।
                        </p>

                        <a
                            href="/shop"
                            className="
                                mt-5
                                inline-flex
                                rounded-xl
                                bg-[#1f5d3b]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#174a2f]
                            "
                        >
                            Browse Shop
                        </a>
                    </div>

                ) : (

                    /* =================================================
                        PRODUCTS
                    ================================================= */

                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-3
                            lg:grid-cols-4
                        "
                    >
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </section>

        </main>
    );
}

সবচেয়ে গুরুত্বপূর্ণ fix

তোমার আগের code-এ ছিল:

const { products } = useSelector(
    (state) => state.product.products
);

এটা ধরে নিচ্ছে "state.product.products" একটি object:

{
    products: [...]
}

কিন্তু তোমার Redux slice যদি এমন হয়:

initialState: {
    products: [],
    ...
}

তাহলে আগের code ভুল।

আমি করেছি:

const products =
    useSelector((state) => state.product?.products) || [];

এতে "products" সরাসরি array হিসেবে পাওয়া যাবে।

তবে তোমার Redux "productSlice" যদি "products"-এর ভিতরে আবার "{ products: [] }" রাখে, তাহলে selector অনুযায়ী সেটা পরিবর্তন করতে হবে।

আর "ShopByCategory" এখন Latest Products-এর মাঝখানে নয়, আলাদা সুন্দর section হিসেবে থাকবে।

একটা বিষয় খেয়াল রাখবে: আমি "a href" ব্যবহার করেছি কারণ simple navigation-এর জন্য ঠিক আছে; চাইলে পুরো HomePage-এ "next/link" ব্যবহার করে আরও optimized version করা যায়।