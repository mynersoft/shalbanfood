import Link from "next/link";
import {
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  PackageX,
} from "lucide-react";

export default function MiniStats({ summary = {}, statusCounts = {} }) {
  const items = [
    {
      label: "Pending Orders",
      value: statusCounts.pending || 0,
      icon: Clock3,
      color: "text-yellow-400",
      href: "/dashboard/orders?status=pending",
    },
    {
      label: "Delivered",
      value: statusCounts.delivered || 0,
      icon: CheckCircle2,
      color: "text-green-400",
      href: "/dashboard/orders?status=delivered",
    },
    {
      label: "Low Stock Variants",
      value: summary.lowStockProducts || 0,
      icon: AlertTriangle,
      color: "text-orange-400",
      href: "/dashboard/inventory",
    },
    {
      label: "Out of Stock Variants",
      value: summary.outOfStockProducts || 0,
      icon: PackageX,
      color: "text-red-400",
      href: "/dashboard/inventory",
    },
  ];

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color, href }) => (
        <Link
          href={href}
          key={label}
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#151821] p-4"
        >
          <Icon size={21} className={color} />
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-1 text-lg font-bold">{value}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}