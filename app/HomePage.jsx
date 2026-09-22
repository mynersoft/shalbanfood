'use client';

import { useSelector } from 'react-redux';
import { useProducts } from '@/hooks/useDashboard';
import ProductCard from '@/components/products/ProductCard';

export default function HomePage() {
  const { isLoading, isFetching } = useProducts();

  const products = useSelector((state) => state.product.products);

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Latest Products
          </h1>

          {isFetching && !isLoading && (
            <span className="text-sm text-gray-500">
              Updating...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              No products available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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