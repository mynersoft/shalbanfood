import Link from "next/link";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";

const money = (v) => `৳${Number(v || 0).toLocaleString("en-BD")}`;

export default function InventoryPanels({
  lowStockProducts = [],
  bestSellingProducts = [],
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-[#151821]">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-semibold">Low Stock Products</h2>
            <p className="mt-1 text-xs text-gray-400">Stock needing attention</p>
          </div>
          <Link href="/dashboard/inventory" className="text-sm text-blue-400">
            Manage
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No low-stock products</p>
        ) : (
          <div className="divide-y divide-white/5">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="p-4">
                <p className="font-medium">{product.name}</p>
                <div className="mt-3 space-y-2">
                  {product.variants
                    .filter((variant) => variant.stock <= 5)
                    .map((variant) => (
                      <div
                        key={variant._id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-gray-400">
                          {variant.value} {variant.unit}
                        </span>
                        <span className={variant.stock <= 0 ? "text-red-400" : "text-orange-400"}>
                          {variant.stock <= 0 ? "Out of stock" : `${variant.stock} left`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#151821]">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-semibold">Best Selling Products</h2>
            <p className="mt-1 text-xs text-gray-400">Based on saved soldCount</p>
          </div>
          <Package size={19} className="text-blue-400" />
        </div>

        {bestSellingProducts.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No products yet</p>
        ) : (
          <div className="divide-y divide-white/5">
            {bestSellingProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3 p-4">
                <span className="rounded-lg bg-white/5 px-3 py-2 text-sm">#{index + 1}</span>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <Package size={20} className="text-gray-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.soldCount}</p>
                  <p className="text-xs text-gray-400">sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}