import { BarChart3 } from "lucide-react";

const money = (v) =>
  `৳${Number(v || 0).toLocaleString("en-BD")}`;

export default function SalesChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.amount || 0), 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#151821]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="font-semibold">Sales Overview</h2>
          <p className="mt-1 text-xs text-gray-400">Last 7 days</p>
        </div>
        <BarChart3 className="text-blue-400" size={20} />
      </div>

      <div className="flex h-64 items-end gap-3 p-5 sm:gap-5">
        {data.map((item, index) => {
          const height = item.amount > 0
            ? Math.max((item.amount / max) * 100, 5)
            : 2;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                title={money(item.amount)}
                className="w-full max-w-10 rounded-t-lg bg-blue-500 transition hover:bg-blue-400"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}