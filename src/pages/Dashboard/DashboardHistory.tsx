import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { RootState } from "../../redux/store";
import type { CategoryWithId } from "../../database/queries";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

type RecentTransaction = {
  id: number;
  name: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  categoryName: string;
  categoryIcon: string;
};

type CategoryBreakdown = {
  id: number;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
};

const DashboardHistory = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);
  const categories = useSelector((state: RootState) => state.category.items);

  const categoryLookup = useMemo(() => {
    const map = new Map<number, CategoryWithId>();
    categories.forEach((category) => map.set(category.id, category));
    return map;
  }, [categories]);

  const recentTransactions = useMemo<RecentTransaction[]>(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return sorted.slice(0, 5).map((transaction) => {
      const category = categoryLookup.get(transaction.categoryId);
      return {
        id: transaction.id,
        name: transaction.name,
        type: transaction.type as "income" | "expense",
        amount: transaction.amount,
        date: transaction.date,
        categoryName: category?.name ?? "Uncategorised",
        categoryIcon: category?.icon ?? "🗂",
      };
    });
  }, [transactions, categoryLookup]);

  const { topCategories, totalExpense } = useMemo<{
    topCategories: CategoryBreakdown[];
    totalExpense: number;
  }>(() => {
    const expenseByCategory = new Map<number, number>();
    let expenseTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") {
        return;
      }

      expenseTotal += transaction.amount;
      const current = expenseByCategory.get(transaction.categoryId) ?? 0;
      expenseByCategory.set(transaction.categoryId, current + transaction.amount);
    });

    const breakdown = Array.from(expenseByCategory.entries())
      .map(([categoryId, amount]) => {
        const category = categoryLookup.get(categoryId);
        return {
          id: categoryId,
          name: category?.name ?? "Uncategorised",
          icon: category?.icon ?? "💸",
          amount,
          percentage: expenseTotal === 0 ? 0 : (amount / expenseTotal) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return {
      topCategories: breakdown,
      totalExpense: expenseTotal,
    };
  }, [transactions, categoryLookup]);

  const { savingsPotential, dailyBurn } = useMemo(() => {
    const now = Date.now();
    const windowStart = now - THIRTY_DAYS_MS;

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      const timestamp = new Date(transaction.date).getTime();
      if (Number.isNaN(timestamp) || timestamp < windowStart) {
        return;
      }

      if (transaction.type === "income") {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
      }
    });

    const burn = expense === 0 ? 0 : expense / 30;
    const potential = Math.max(0, income - expense);

    return {
      savingsPotential: potential,
      dailyBurn: burn,
    };
  }, [transactions]);

  const formatCurrency = (value: number, maximumFractionDigits = 0) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits,
    }).format(value);

  const formatDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(parsed);
  };

  return (
    <section className="flex flex-col gap-6">
      <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)]/85 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.55)] transition-colors duration-500 dark:bg-[var(--surface-card)]/85">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Recent activity</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Latest transactions</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Track the freshest inflows and outflows at a glance.
            </p>
          </div>
        </header>

        <ul className="mt-5 space-y-3">
          {recentTransactions.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[var(--surface-2)] bg-[var(--surface-1)]/70 px-4 py-6 text-center text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]/60">
              No transactions logged yet. Start by adding your first record.
            </li>
          )}
          {recentTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 transition-colors duration-300 hover:border-[var(--accent)]/40 hover:bg-[var(--surface-1)]/95 dark:bg-[var(--surface-2)]/80"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl border text-sm ${
                    transaction.type === "income"
                      ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-500"
                      : "border-rose-400/40 bg-rose-400/15 text-rose-500"
                  }`}
                  aria-hidden="true"
                >
                  {transaction.type === "income" ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{transaction.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {transaction.categoryIcon} {transaction.categoryName} • {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    transaction.type === "income" ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "−"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)]/85 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.55)] transition-colors duration-500 dark:bg-[var(--surface-card)]/85">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Spending profile</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Top categories</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Understand where your budget goes and surface optimisation opportunities.
            </p>
          </div>
        </header>

        <div className="mt-5 space-y-4">
          {topCategories.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[var(--surface-2)] bg-[var(--surface-1)]/70 px-4 py-6 text-center text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]/60">
              Add expense transactions to unlock category insights.
            </p>
          )}

          {topCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 p-4 dark:bg-[var(--surface-2)]/75"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {category.percentage.toFixed(0)}% of expense
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-rose-500">
                  −{formatCurrency(category.amount)}
                </p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600"
                  style={{ width: `${Math.min(100, category.percentage)}%` }}
                  aria-label={`${category.name} share`}
                />
              </div>
            </div>
          ))}
        </div>

        {totalExpense > 0 && (
          <div className="mt-6 rounded-3xl border border-[var(--accent)]/45 bg-[var(--accent)]/12 p-5 text-sm text-[var(--text-secondary)] shadow-[0_30px_90px_-70px_rgba(57,255,20,0.45)]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)]/20 text-[var(--accent)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Savings momentum</p>
                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  You could set aside {formatCurrency(savingsPotential)} this month if you keep spending steady.
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Daily burn averages {formatCurrency(dailyBurn, 0)}. Aim for{" "}
                  {formatCurrency(totalExpense * 0.8, 0)} or less in expenses to boost your runway.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default DashboardHistory;
