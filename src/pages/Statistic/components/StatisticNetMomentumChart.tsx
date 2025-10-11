import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MomentumPoint } from "../types";
import { formatFullCurrency, formatPercentage } from "../utils/format";

type StatisticNetMomentumChartProps = {
  data: MomentumPoint[];
};

const StatisticNetMomentumChart = ({ data }: StatisticNetMomentumChartProps) => {
  const hasData = data.length > 0;

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Momentum</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Net balance trajectory</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Area shows monthly net cash flow, with a line tracking cumulative balance and savings rate.
        </p>
      </header>

      <div className="mt-6 h-[320px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value as number)
                }
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Savings rate") {
                    return [formatPercentage(Number(value)), name];
                  }
                  return [formatFullCurrency(Number(value)), name];
                }}
                contentStyle={{
                  background: "var(--surface-0)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-soft)",
                  color: "var(--text-primary)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingBottom: 12 }}
              />
              <Area
                type="monotone"
                name="Net cashflow"
                dataKey="net"
                yAxisId="left"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#netGradient)"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                name="Cumulative balance"
                dataKey="cumulativeNet"
                yAxisId="left"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                name="Savings rate"
                dataKey="savingsRate"
                yAxisId="right"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[var(--border-soft)] text-sm text-[var(--text-muted)]">
            Not enough data to render momentum insights yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default StatisticNetMomentumChart;
