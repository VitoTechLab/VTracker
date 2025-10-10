import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
import type { RootState } from "../../redux/store";
import type { CategoryWithId } from "../../database/queries";

type TimeframeOption = "30" | "90" | "365" | "all";

type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  title: string;
  trend?: string;
};

const timeframeOptions: { id: TimeframeOption; label: string }[] = [
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "365", label: "12 months" },
  { id: "all", label: "All time" },
];

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const formatCurrency = (value: number, maximumFractionDigits = 0) => {
  const absolute = Math.abs(value);
  const useCompact = absolute >= 1_000_000_000;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: useCompact ? "compact" : "standard",
    maximumFractionDigits: useCompact ? 2 : maximumFractionDigits,
  }).format(value);
};

const formatFullCurrency = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);

const Statistic = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);
  const categories = useSelector((state: RootState) => state.category.items);
  const [timeframe, setTimeframe] = useState<TimeframeOption>("90");

  const filteredTransactions = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }
    const now = Date.now();
    const windowDays = timeframe === "all" ? Number.POSITIVE_INFINITY : Number(timeframe);

    return transactions.filter((transaction) => {
      const timestamp = new Date(transaction.date).getTime();
      if (Number.isNaN(timestamp)) {
        return false;
      }
      if (!Number.isFinite(windowDays)) {
        return true;
      }
      return now - timestamp <= windowDays * MS_IN_DAY;
    });
  }, [transactions, timeframe]);

  const categoryLookup = useMemo(() => {
    const map = new Map<number, CategoryWithId>();
    categories.forEach((category) => map.set(category.id, category));
    return map;
  }, [categories]);

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    if (filteredTransactions.length === 0) {
      return [
        {
          id: "empty",
          label: "No activity",
          value: "—",
          title: "Add income and expense records to unlock insights",
        },
      ];
    }

    const income = filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const net = income - expense;
    const average =
      filteredTransactions.length === 0
        ? 0
        : filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0) /
          filteredTransactions.length;
    const largest = filteredTransactions.reduce(
      (acc, transaction) => (transaction.amount > acc ? transaction.amount : acc),
      0,
    );
    const savingsRate = income === 0 ? 0 : Math.max(0, ((income - expense) / income) * 100);

    return [
      {
        id: "income",
        label: "Total Income",
        value: formatCurrency(income),
        title: formatFullCurrency(income),
        trend: `${filteredTransactions.filter((item) => item.type === "income").length} records`,
      },
      {
        id: "expense",
        label: "Total Expense",
        value: formatCurrency(expense),
        title: formatFullCurrency(expense),
        trend: `${filteredTransactions.filter((item) => item.type === "expense").length} records`,
      },
      {
        id: "net",
        label: "Net Balance",
        value: formatCurrency(net),
        title: formatFullCurrency(net),
        trend: net >= 0 ? "Positive net cashflow" : "Negative net cashflow",
      },
      {
        id: "average",
        label: "Average Ticket",
        value: formatCurrency(average, average > 100 ? 0 : 2),
        title: formatFullCurrency(average, 2),
        trend: "Per transaction",
      },
      {
        id: "largest",
        label: "Largest Transaction",
        value: formatCurrency(largest),
        title: formatFullCurrency(largest),
      },
      {
        id: "savingsRate",
        label: "Savings Rate",
        value: `${savingsRate.toFixed(1)}%`,
        title: `${savingsRate.toFixed(1)}% of income retained`,
      },
    ];
  }, [filteredTransactions]);

  const monthlySeries = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return [];
    }

    const map = new Map<string, { income: number; expense: number }>();

    filteredTransactions.forEach((transaction) => {
      const parsed = new Date(transaction.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
      const bucket = map.get(key) ?? { income: 0, expense: 0 };
      if (transaction.type === "income") {
        bucket.income += transaction.amount;
      } else {
        bucket.expense += transaction.amount;
      }
      map.set(key, bucket);
    });

    return Array.from(map.entries())
      .sort((a, b) => new Date(`${a[0]}-01`).getTime() - new Date(`${b[0]}-01`).getTime())
      .map(([key, value]) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Date(year, (month ?? 1) - 1, 1).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        return {
          key,
          label,
          income: Number(value.income.toFixed(2)),
          expense: Number(value.expense.toFixed(2)),
        };
      });
  }, [filteredTransactions]);

  const categoryBreakdown = useMemo(() => {
    const incomeMap = new Map<number, number>();
    const expenseMap = new Map<number, number>();

    filteredTransactions.forEach((transaction) => {
      const targetMap = transaction.type === "income" ? incomeMap : expenseMap;
      const current = targetMap.get(transaction.categoryId) ?? 0;
      targetMap.set(transaction.categoryId, current + transaction.amount);
    });

    const createList = (map: Map<number, number>) => {
      const total = Array.from(map.values()).reduce((sum, amount) => sum + amount, 0);
      return Array.from(map.entries())
        .map(([categoryId, totalAmount]) => {
          const category = categoryLookup.get(categoryId);
          return {
            id: categoryId,
            name: category?.name ?? "Uncategorised",
            icon: category?.icon ?? "—",
            total: totalAmount,
            percentage: total === 0 ? 0 : (totalAmount / total) * 100,
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    };

    return {
      income: createList(incomeMap),
      expense: createList(expenseMap),
    };
  }, [filteredTransactions, categoryLookup]);

  const hasData = filteredTransactions.length > 0;

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Performance</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Statistics</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Analyse your financial performance, understand category trends, and monitor savings progress.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] p-1 dark:bg-[var(--surface-2)]">
            {timeframeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTimeframe(option.id)}
                className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  timeframe === option.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-pressed={timeframe === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryMetrics.map((metric) => (
            <article
              key={metric.id}
              className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]" title={metric.title}>
                {metric.value}
              </p>
              {metric.trend && <p className="mt-1 text-xs text-[var(--text-muted)]">{metric.trend}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Trend</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Monthly cashflow</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Bars show income versus expense totals per month based on the selected timeframe.
          </p>
        </header>

        <div className="mt-6 h-[320px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
                      value as number,
                    )
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
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12 }} />
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

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Top inflows</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Income by category</h3>
          </header>

          <div className="mt-4 space-y-3">
            {categoryBreakdown.income.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-6 text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]">
                Record income transactions to see category insights.
              </p>
            )}

            {categoryBreakdown.income.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {category.percentage.toFixed(1)}% of income
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[var(--success)]" title={formatFullCurrency(category.total)}>
                    +{formatCurrency(category.total)}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${Math.min(100, category.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Top outflows</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Expense by category</h3>
          </header>

          <div className="mt-4 space-y-3">
            {categoryBreakdown.expense.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-6 text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]">
                Record expense transactions to evaluate spending categories.
              </p>
            )}

            {categoryBreakdown.expense.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {category.percentage.toFixed(1)}% of expense
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[var(--danger)]" title={formatFullCurrency(category.total)}>
                    -{formatCurrency(category.total)}
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-rose-500/80"
                    style={{ width: `${Math.min(100, category.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
};

export default Statistic;
