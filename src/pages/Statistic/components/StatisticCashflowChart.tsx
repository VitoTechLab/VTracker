import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySeriesPoint } from "../types";
import { formatFullCurrency } from "../utils/format";

type StatisticCashflowChartProps = {
  data: MonthlySeriesPoint[];
};

const StatisticCashflowChart = ({ data }: StatisticCashflowChartProps) => {
  const hasData = data.length > 0;

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Trend</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Monthly cash flow</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Bars show income versus expense totals per month based on the selected timeframe.
        </p>
      </header>

      <div className="mt-6 h-[320px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value as number)
                }
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatFullCurrency(value)}
                contentStyle={{
                  background: "var(--surface-0)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-soft)",
                  color: "var(--text-primary)",
                }}
                cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingBottom: 12 }}
              />
              <Bar dataKey="income" name="Income" fill="#16a34a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[var(--border-soft)] text-sm text-[var(--text-muted)]">
            No transactions available for the selected timeframe.
          </div>
        )}
      </div>
    </section>
  );
};

export default StatisticCashflowChart;
