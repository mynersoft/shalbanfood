'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Save,
    Package,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

function calculatePrice(variant) {
    const buy = Number(variant.buyPrice) || 0;
    const regular = Number(variant.regularPrice) || 0;
    const sell = Number(variant.sellPrice) || 0;

    return {
        discount: Math.max(0, regular - sell),
        percentage: regular > 0
            ? Math.round(((regular - sell) / regular) * 100)
            : 0,
        profit: sell - buy,
    };
}

function PriceInput({ label, value, onChange }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block text-xs text-zinc-500">
                {label}
            </span>

            <input
                type="number"
                min="0"
                step="0.01"
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-2.5 text-sm outline-none focus:border-green-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
        </label>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="h-40 rounded-xl bg-zinc-200 dark:bg-zinc-800"
                />
            ))}
        </div>
    );
}


export default function ProductPriceEditor() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
        limit: 10,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    async function loadProducts(signal) {
        setLoading(true);
        setError('');

        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: '10',
                search: debouncedSearch,
            });

            const response = await fetch(
                `/api/products/prices?${query}`,
                {
                    cache: 'no-store',
                    signal,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Product লোড করা যায়নি।'
                );
            }

            setProducts(result.products || []);
            setPagination(result.pagination);
        } catch (err) {
            if (err.name === 'AbortError') return;

            setError(err.message);
            toast.error(err.message);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        const controller = new AbortController();

        loadProducts(controller.signal);

        return () => controller.abort();
    }, [page, debouncedSearch]);

    function updateVariant(productId, variantId, field, value) {
        setProducts((current) =>
            current.map((product) =>
                product._id !== productId
                    ? product
                    : {
                        ...product,
                        variants: product.variants.map((variant) =>
                            variant._id !== variantId
                                ? variant
                                : {
                                    ...variant,
                                    [field]: value,
                                }
                        ),
                    }
            )
        );
    }

    async function saveVariant(product, variant) {
        const key = `${product._id}:${variant._id}`;

        const prices = [
            variant.buyPrice,
            variant.regularPrice,
            variant.sellPrice,
        ].map(Number);

        if (
            prices.some(
                (price) => !Number.isFinite(price) || price < 0
            )
        ) {
            toast.error('সব দামের ঘরে সঠিক সংখ্যা লিখুন।');
            return;
        }

        const [buyPrice, regularPrice, sellPrice] = prices;

        if (sellPrice > regularPrice) {
            toast.error(
                'Sell Price, Regular Price-এর চেয়ে বেশি হতে পারবে না।'
            );
            return;
        }

        setSaving((current) => ({ ...current, [key]: true }));

        try {
            const response = await fetch(
                `/api/products/${product._id}/prices`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        variantId: variant._id,
                        buyPrice,
                        regularPrice,
                        sellPrice,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Save করা যায়নি।'
                );
            }

            toast.success('দাম Update হয়েছে।');

            // Fetch canonical values from the server.
            await loadProducts();
        } catch (err) {
            toast.error(err.message || 'সমস্যা হয়েছে।');
        } finally {
            setSaving((current) => ({
                ...current,
                [key]: false,
            }));
        }
    }

    const summary = useMemo(() => {
        return {
            products: pagination.total,
            variants: products.reduce(
                (total, product) =>
                    total + product.variants.length,
                0
            ),
        };
    }, [products, pagination.total]);

    return (
        <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        Price Management
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Shalban Food · Product Pricing
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadProducts()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <Package className="mb-2 text-green-600" size={20} />
                    <p className="text-sm text-zinc-500">
                        Total Products
                    </p>
                    <p className="text-2xl font-bold">
                        {pagination.total}
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <Package className="mb-2 text-green-600" size={20} />
                    <p className="text-sm text-zinc-500">
                        Current Page Variants
                    </p>
                    <p className="text-2xl font-bold">
                        {summary.variants}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900">
                <Search size={18} className="text-zinc-400" />

                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="পণ্যের নাম দিয়ে Search..."
                    className="w-full bg-transparent py-3 text-sm outline-none"
                />
            </div>

            {loading && <Skeleton />}

            {!loading && error && (
                <div className="rounded-xl border border-red-200 p-5 text-sm text-red-600">
                    {error}
                    <button
                        type="button"
                        onClick={() => loadProducts()}
                        className="ml-3 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="rounded-xl border border-dashed p-10 text-center">
                    <Package className="mx-auto mb-3 text-zinc-400" />
                    <p className="font-medium">
                        কোনো Product পাওয়া যায়নি।
                    </p>
                </div>
            )}

            {!loading && !error && products.map((product) => (
                <section
                    key={product._id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
                        <h2 className="font-semibold">
                            {product.name}
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            {product.variants.length} Variants
                        </p>
                    </div>

                    <div className="space-y-4 p-3 sm:p-4">
                        {product.variants.map((variant) => {
                            const key =
                                `${product._id}:${variant._id}`;

                            const info = calculatePrice(variant);

                            return (
                                <div
                                    key={variant._id}
                                    className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                            {variant.value} {variant.unit}
                                        </span>

                                        {info.percentage > 0 && (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-300">
                                                {info.percentage}% OFF
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <PriceInput
                                            label="Buy Price (৳)"
                                            value={variant.buyPrice}
                                            onChange={(value) =>
                                                updateVariant(
                                                    product._id,
                                                    variant._id,
                                                    'buyPrice',
                                                    value
                                                )
                                            }
                                        />

                                        <PriceInput
                                            label="Regular Price (৳)"
                                            value={variant.regularPrice}
                                            onChange={(value) =>
                                                updateVariant(
                                                    product._id,
                                                    variant._id,
                                                    'regularPrice',
                                                    value
                                                )
                                            }
                                        />

                                        <PriceInput
                                            label="Sell Price (৳)"
                                            value={variant.sellPrice}
                                            onChange={(value) =>
                                                updateVariant(
                                                    product._id,
                                                    variant._id,
                                                    'sellPrice',
                                                    value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-3">
                                        <div className="space-y-1 text-sm">
                                            <p className="text-green-700 dark:text-green-400">
                                                Discount: ৳{info.discount}
                                            </p>

                                            <p className={
                                                info.profit < 0
                                                    ? 'font-medium text-red-600'
                                                    : 'text-zinc-500'
                                            }>
                                                {info.profit < 0
                                                    ? 'Loss'
                                                    : 'Profit'}
                                                : ৳{info.profit}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={Boolean(saving[key])}
                                            onClick={() =>
                                                saveVariant(product, variant)
                                            }
                                            className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {saving[key] ? (
                                                <LoaderCircle
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {!loading && !error && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <span className="text-sm text-zinc-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                            className="rounded-lg border p-2 disabled:opacity-40 dark:border-zinc-700"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <button
                            type="button"
                            disabled={page >= pagination.totalPages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                            className="rounded-lg border p-2 disabled:opacity-40 dark:border-zinc-700"
                            aria-label="Next page"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}