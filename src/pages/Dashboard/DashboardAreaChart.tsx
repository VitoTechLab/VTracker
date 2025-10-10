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
import type { RootState } from "../../redux/store";

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
          <span
            className={`font-semibold ${
              Number(balance) >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              Number(balance) || 0,
            )}
          </span>
        </p>
      </div>
    </div>
  );
};

const DashboardAreaChart = () => {
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

    return sorted.map(([date, value]) => {
      runningBalance += value.income - value.expense;
      const savingsRate =
        value.income === 0 ? 0 : Math.max(0, ((value.income - value.expense) / value.income) * 100);

      return {
        date,
        income: Number(value.income.toFixed(2)),
        expense: Number(value.expense.toFixed(2)),
        balance: Number(runningBalance.toFixed(2)),
        savingsRate: Number(savingsRate.toFixed(1)),
      };
    });
  }, [transactions]);

  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    if (augmentedDailyData.length === 0) {
      return [];
    }

    const monthMap = new Map<string, { income: number; expense: number }>();

    augmentedDailyData.forEach((item) => {
      const [year, month] = item.date.split("-");
      const key = `${year}-${month}`;
      const entry = monthMap.get(key) ?? { income: 0, expense: 0 };
      entry.income += item.income;
      entry.expense += item.expense;
      monthMap.set(key, entry);
    });

    const sorted = Array.from(monthMap.entries()).sort(
      (a, b) => new Date(`${a[0]}-01`).getTime() - new Date(`${b[0]}-01`).getTime(),
    );

    let runningBalance = 0;

    return sorted.map(([key, value]) => {
      runningBalance += value.income - value.expense;
      const savingsRate =
        value.income === 0 ? 0 : Math.max(0, ((value.income - value.expense) / value.income) * 100);

      const [year, month] = key.split("-").map(Number);
      const label = new Date(year, (month ?? 1) - 1, 1).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      return {
        month: label,
        income: Number(value.income.toFixed(2)),
        expense: Number(value.expense.toFixed(2)),
        balance: Number(runningBalance.toFixed(2)),
        savingsRate: Number(savingsRate.toFixed(1)),
      };
    });
  }, [augmentedDailyData]);

  const chartData = timeframe === "daily" ? augmentedDailyData : monthlyData;
  const xKey = timeframe === "daily" ? "date" : "month";

  const summary = useMemo<ChartSummary>(() => {
    if (chartData.length === 0) {
      return { income: 0, expense: 0, balance: 0, savingsRate: 0 };
    }

    const totals = chartData.reduce(
      (acc, item) => {
        acc.income += item.income;
        acc.expense += item.expense;
        acc.balance = item.balance;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );

    const savingsRate =
      totals.income === 0 ? 0 : Math.max(0, ((totals.income - totals.expense) / totals.income) * 100);

    return {
      income: totals.income,
      expense: totals.expense,
      balance: totals.balance,
      savingsRate,
    };
  }, [chartData]);

  const brushStartIndex = Math.max(0, chartData.length - 8);
  const brushEndIndex = chartData.length - 1;

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Cashflow insights</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Income vs Expense Trend</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Monitor your cashflow performance and savings health over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] p-1 dark:bg-[var(--surface-2)]">
            {(["daily", "monthly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTimeframe(option)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  timeframe === option
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(summary.income)}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Expense {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(summary.expense)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
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
              align="right"
              iconType="circle"
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

export default DashboardAreaChart;
