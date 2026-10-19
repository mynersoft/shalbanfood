import Link from "next/link";
import { ArrowRight, Eye, Package } from "lucide-react";

const money = (v) => `৳${Number(v || 0).toLocaleString("en-BD")}`;

const STATUS = {
  pending: "text-yellow-400",
  processing: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-green-400",
  cancelled: "text-red-400",
  return: "text-orange-400",
};

export default function RecentOrders({ orders = [] }) {
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#151821]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="font-semibold">Recent Orders</h2>
          <p className="mt-1 text-xs text-gray-400">Latest orders</p>
        </div>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-sm text-blue-400"
        >
          View All <ArrowRight size={15} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-400">No orders yet</p>
      ) : (
        <div className="divide-y divide-white/5">
          {recent.map((order) => (
            <div
              key={order._id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Package size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {order.invoiceNo || `#${String(order._id).slice(-8)}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {order.customer?.name || "Customer"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs capitalize ${STATUS[order.status] || "text-gray-400"}`}>
                  {order.status}
                </span>
                <strong className="text-sm">{money(order.total)}</strong>
                <Link
                  href={`/dashboard/orders/${order._id}`}
                  title="View order"
                  className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white"
                >
                  <Eye size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}