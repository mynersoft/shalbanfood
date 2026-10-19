import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";

const money = (v) =>
  `৳${Number(v || 0).toLocaleString("en-BD")}`;

export default function StatCards({ summary = {} }) {
  const cards = [
    {
      title: "This Month Sales",
      value: money(summary.monthSales),
      icon: DollarSign,
      color: "text-green-400 bg-green-500/10",
      href: "/dashboard/orders",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-400 bg-blue-500/10",
      href: "/dashboard/orders",
    },
    {
      title: "Customers",
      value: summary.customers || 0,
      icon: Users,
      color: "text-purple-400 bg-purple-500/10",
      href: "/dashboard/users",
    },
    {
      title: "Products",
      value: summary.products || 0,
      icon: Package,
      color: "text-orange-400 bg-orange-500/10",
      href: "/dashboard/products",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, color, href }) => (
        <Link
          key={title}
          href={href}
          className="rounded-2xl border border-white/10 bg-[#151821] p-5 transition hover:border-white/20"
        >
          <div className="flex items-center justify-between">
            <span className={`rounded-xl p-3 ${color}`}>
              <Icon size={21} />
            </span>
            <ArrowUpRight size={17} className="text-gray-500" />
          </div>

          <p className="mt-5 text-sm text-gray-400">{title}</p>
          <h2 className="mt-1 text-2xl font-bold">{value}</h2>
        </Link>
      ))}
    </div>
  );
}