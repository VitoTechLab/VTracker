import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Brush,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { RootState } from "../../../redux/store";

type DailyPoint = {
  date: string;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
};

type MonthlyPoint = {
  month: string;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
};

type ChartSummary = {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
};

const ChartTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const income = payload.find((item) => item.dataKey === "income")?.value ?? 0;
  const expense = payload.find((item) => item.dataKey === "expense")?.value ?? 0;
  const balance = payload.find((item) => item.dataKey === "balance")?.value ?? 0;

  return (
    <div className="w-64 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-0)]/95 p-4 text-sm shadow-[0_25px_80px_-55px_rgba(15,23,42,0.8)] backdrop-blur-xl dark:bg-[var(--surface-card)]/95">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{label}</p>
      <div className="mt-3 space-y-2 text-[var(--text-primary)]">
        <p className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Income
          </span>
          <span className="font-semibold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              Number(income) || 0,
            )}
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Expense
          </span>
          <span className="font-semibold text-rose-500">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              Number(expense) || 0,
            )}
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Balance
          </span>
          <span className={`font-semibold ${Number(balance) >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              Number(balance) || 0,
            )}
          </span>
        </p>
      </div>
    </div>
  );
};

const DashboardPerformanceChart = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("daily");

  const augmentedDailyData = useMemo<DailyPoint[]>(() => {
    if (transactions.length === 0) {
      return [];
    }

    const map = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const parsed = new Date(transaction.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }

      const normalizedDate = parsed.toISOString().split("T")[0];
      const entry = map.get(normalizedDate) ?? { income: 0, expense: 0 };

      if (transaction.type === "income") {
        entry.income += transaction.amount;
      } else {
        entry.expense += transaction.amount;
      }

      map.set(normalizedDate, entry);
    });

    const sorted = Array.from(map.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
    );

    let runningBalance = 0;

    return sorted.map(([date, values]) => {
      runningBalance += values.income - values.expense;
      const total = values.income === 0 ? 0 : ((values.income - values.expense) / values.income) * 100;

      return {
        date,
        income: values.income,
        expense: values.expense,
        balance: runningBalance,
        savingsRate: Number.isFinite(total) ? Math.max(0, total) : 0,
      };
    });
  }, [transactions]);

  const aggregatedMonthlyData = useMemo<MonthlyPoint[]>(() => {
    if (augmentedDailyData.length === 0) {
      return [];
    }

    const map = new Map<string, { income: number; expense: number; balance: number }>();

    augmentedDailyData.forEach((point) => {
      const [year, month] = point.date.split("-");
      const key = `${year}-${month}`;
      const entry = map.get(key) ?? { income: 0, expense: 0, balance: 0 };

      entry.income += point.income;
      entry.expense += point.expense;
      entry.balance = point.balance;

      map.set(key, entry);
    });

    return Array.from(map.entries())
      .sort((a, b) => new Date(`${a[0]}-01`).getTime() - new Date(`${b[0]}-01`).getTime())
      .map(([month, values]) => {
        const savingsRate = values.income === 0 ? 0 : ((values.income - values.expense) / values.income) * 100;

        return {
          month,
          income: values.income,
          expense: values.expense,
          balance: values.balance,
          savingsRate: Math.max(0, savingsRate),
        };
      });
  }, [augmentedDailyData]);

  const chartData = timeframe === "daily" ? augmentedDailyData : aggregatedMonthlyData;
  const xKey = timeframe === "daily" ? "date" : "month";
  const summary = useMemo<ChartSummary>(() => {
    if (chartData.length === 0) {
      return {
        income: 0,
        expense: 0,
        balance: 0,
        savingsRate: 0,
      };
    }

    return chartData.reduce(
      (acc, point) => ({
        income: acc.income + point.income,
        expense: acc.expense + point.expense,
        balance: point.balance,
        savingsRate: acc.savingsRate + point.savingsRate,
      }),
      {
        income: 0,
        expense: 0,
        balance: 0,
        savingsRate: 0,
      },
    );
  }, [chartData]);

  const formatPeriodLabel = (label: string) => {
    if (timeframe === "daily") {
      const parsed = new Date(label);
      if (Number.isNaN(parsed.getTime())) {
        return label;
      }
      return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    const [year, month] = label.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const brushStartIndex = chartData.length > 16 ? chartData.length - 16 : 0;
  const brushEndIndex = chartData.length - 1;

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Performance</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Income vs expense trend</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Navigate your cash flow trajectory and savings momentum.
          </p>
        </div>
        <div className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] p-1 text-xs text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
          <button
            type="button"
            onClick={() => setTimeframe("daily")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              timeframe === "daily" ? "bg-[var(--accent)] text-white shadow-sm" : ""
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("monthly")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              timeframe === "monthly" ? "bg-[var(--accent)] text-white shadow-sm" : ""
            }`}
          >
            Monthly
          </button>
        </div>
      </header>

      <div className="mt-6 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.08} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" strokeDasharray="4 8" vertical={false} />
            <XAxis
              dataKey={xKey}
              tickMargin={12}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPeriodLabel}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value as number)
              }
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(148, 163, 184, 0.3)", strokeWidth: 1 }} />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingBottom: 12, paddingTop: 12 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              name="Income"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              name="Expense"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#2563eb"
              strokeWidth={1.5}
              fill="url(#balanceGradient)"
              name="Balance"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            {chartData.length > 8 && (
              <Brush
                dataKey={xKey}
                height={28}
                startIndex={brushStartIndex}
                endIndex={brushEndIndex}
                travellerWidth={12}
                stroke="rgba(148, 163, 184, 0.35)"
                fill="rgba(15, 23, 42, 0.05)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Net balance</p>
          <p className={`mt-2 text-lg font-semibold ${summary.balance >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              summary.balance,
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Cumulative balance across selected period</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Savings rate</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{summary.savingsRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Income retained after expenses</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Total income</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              summary.income,
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Gross inflow for selected period</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Total expense</p>
          <p className="mt-2 text-lg font-semibold text-rose-500">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              summary.expense,
            )}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Gross outflow for selected period</p>
        </div>
      </div>
    </section>
  );
};

export default DashboardPerformanceChart;
