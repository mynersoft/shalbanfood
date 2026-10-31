import Link from "next/link";
import {
  Clock3,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

const CONFIG = {
  pending: ["Pending", Clock3, "text-yellow-400"],
  processing: ["Processing", RefreshCw, "text-blue-400"],
  shipped: ["Shipped", Truck, "text-purple-400"],
  delivered: ["Delivered", CheckCircle2, "text-green-400"],
  cancelled: ["Cancelled", XCircle, "text-red-400"],
  return: ["Return", RotateCcw, "text-orange-400"],
};

export default function OrderStatus({ statusCounts = {}, totalOrders = 0 }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151821]">
      <div className="border-b border-white/10 p-5">
        <h2 className="font-semibold">Order Status</h2>
        <p className="mt-1 text-xs text-gray-400">Order breakdown</p>
      </div>

      <div className="space-y-3 p-5 flex">
        {Object.entries(CONFIG).map(([status, config]) => {
          const [label, Icon, color] = config;
          const count = statusCounts[status] || 0;
          const percent = totalOrders
            ? Math.round((count / totalOrders) * 100)
            : 0;

          return (
            <Link
              key={status}
              href={`/dashboard/orders?status=${status}`}
              className="block rounded-xl border border-white/5 p-3 hover:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`flex items-center gap-2 text-sm ${color}`}>
                  <Icon size={17} />
                  {label}
                </span>
                <span className="font-semibold">{count}</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-current"
                  style={{ width: `${percent}%`, color: "currentColor" }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-gray-500">
                {percent}%
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}