import Link from "next/link";
import { Package, Wallet, CalendarDays } from "lucide-react";

const money = (v) => `৳${Number(v || 0).toLocaleString("en-BD")}`;

export default function SummaryCards({ summary = {} }) {
  const items = [
    {
      title: "Stock Quantity",
      value: Number(summary.stockQuantity || 0).toLocaleString("en-BD"),
      icon: Package,
      href: "/dashboard/inventory",
    },
    {
      title: "Stock Sales Value",
      value: money(summary.stockSalesValue),
      icon: Wallet,
      href: "/dashboard/inventory",
    },
    {
      title: "Today's Sales",
      value: money(summary.todaySales),
      icon: CalendarDays,
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ title, value, icon: Icon, href }) => (
        <Link
          href={href}
          key={title}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151821] p-5 hover:border-white/20"
        >
          <span className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
            <Icon size={21} />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="mt-1 break-words text-xl font-bold">{value}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}