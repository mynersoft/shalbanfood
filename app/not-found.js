
import Link from "next/link";
import { Home, ShoppingBag, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-xl text-center">

        {/* 404 Illustration */}
        <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-full bg-green-100">
          <SearchX
            size={76}
            strokeWidth={1.5}
            className="text-green-800"
          />

          <span className="absolute -right-3 -top-2 rounded-xl bg-green-800 px-3 py-1.5 text-xl font-bold text-white shadow-md">
            404
          </span>
        </div>

        {/* Message */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          Page Not Found
        </p>

        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-5xl">
          পেজটি খুঁজে পাওয়া যায়নি!
        </h1>

        <p className="mx-auto mb-8 max-w-md text-base leading-7 text-gray-600">
          
          আমাদের খাঁটি মধু ও গাওয়া ঘি দেখতে শপে ফিরে যান।
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
          >
            <Home size={20} />
            হোম পেজে ফিরুন
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-800 bg-white px-6 py-3.5 font-semibold text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
          >
            <ShoppingBag size={20} />
            শপিং করুন
          </Link>

        </div>

        <p className="mt-10 text-sm text-gray-500">
          <span className="font-semibold text-green-800">
            Shalban Food
          </span>
          {" "}— স্বাদের সাথে আস্থার বন্ধন
        </p>

      </div>
    </main>
  );
}
