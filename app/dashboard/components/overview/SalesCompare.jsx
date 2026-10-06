'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const salesData = [
  { date: '1 Oct', runningMonth: 1200, lastMonth: 900 },
  { date: '3 Oct', runningMonth: 1850, lastMonth: 1400 },
  { date: '5 Oct', runningMonth: 2600, lastMonth: 2100 },
  { date: '7 Oct', runningMonth: 3400, lastMonth: 2800 },
  { date: '9 Oct', runningMonth: 4200, lastMonth: 3500 },
  { date: '11 Oct', runningMonth: 5100, lastMonth: 4300 },
  { date: '13 Oct', runningMonth: 5900, lastMonth: 4800 },
  { date: '15 Oct', runningMonth: 6800, lastMonth: 5600 },
  { date: '17 Oct', runningMonth: 7600, lastMonth: 6300 },
  { date: '19 Oct', runningMonth: 8500, lastMonth: 7100 },
  { date: '21 Oct', runningMonth: 9300, lastMonth: 7800 },
  { date: '23 Oct', runningMonth: 10100, lastMonth: 8400 },
  { date: '25 Oct', runningMonth: 11200, lastMonth: 9200 },
  { date: '27 Oct', runningMonth: 12100, lastMonth: 10100 },
  { date: '29 Oct', runningMonth: 13200, lastMonth: 11000 },
  { date: '31 Oct', runningMonth: 14500, lastMonth: 12100 },
];

const formatCurrency = (value) => {
  return `৳${Number(value).toLocaleString('en-BD')}`;
};

export default function DashboardOverview() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#131318] sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sales Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Running month vs last month
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-300">
              Running Month
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              Last Month
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={salesData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-gray-200 dark:text-white/10"
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor',
              }}
              className="text-gray-500 dark:text-gray-400"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: 'currentColor',
              }}
              tickFormatter={formatCurrency}
              className="text-gray-500 dark:text-gray-400"
            />

            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid rgba(128,128,128,0.2)',
                backgroundColor: 'var(--tooltip-bg)',
              }}
              formatter={(value) => [
                formatCurrency(value),
                '',
              ]}
              labelStyle={{
                fontWeight: 600,
              }}
            />

            <Line
              type="monotone"
              dataKey="runningMonth"
              name="Running Month"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="lastMonth"
              name="Last Month"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-200 pt-5 dark:border-white/10">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Running Month
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            ৳14,500
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last Month
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            ৳12,100
          </p>
        </div>
      </div>
    </section>
  );
}