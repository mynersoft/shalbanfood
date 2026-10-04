import Link from 'next/link';
import {
    ArrowRight,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';

const CheckEmptyCart = () => {
    return (
        <main className="min-h-[70vh] bg-[#f8faf9] px-4 py-12 sm:py-20">
            <div className="mx-auto max-w-xl">
                <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
                    {/* Icon */}
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#eef9f3]">
                        <ShoppingCart
                            size={42}
                            strokeWidth={1.6}
                            className="text-[#16834b]"
                        />

                        <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
                            <Sparkles
                                size={15}
                                className="text-[#16834b]"
                            />
                        </div>
                    </div>

                    {/* Text */}
                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#16834b]">
                        Shalban Food
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Your Cart is Empty
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                        Looks like you haven&apos;t added
                        anything to your cart yet. Explore
                        our natural and quality food products.
                    </p>

                    {/* Button */}
                    <Link
                        href="/shop"
                        className="group mx-auto mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#16834b] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#116b3d] hover:shadow-lg active:scale-[0.98]"
                    >
                        <ShoppingBag size={18} />

                        Start Shopping

                        <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </Link>

                    {/* Small info */}
                    <div className="mt-8 flex items-center justify-center gap-2 border-t border-gray-100 pt-6 text-xs text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16834b]" />
                        Quality products from Shalban Food
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckEmptyCart;