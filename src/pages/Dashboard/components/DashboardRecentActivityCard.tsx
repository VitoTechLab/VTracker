import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { RootState } from "../../../redux/store";
import type { CategoryWithId } from "../../../database/queries";

type RecentTransaction = {
  id: number;
  name: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  categoryName: string;
  categoryIcon: string;
};

const DashboardRecentActivityCard = () => {
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
        categoryIcon: category?.icon ?? "??",
      };
    });
  }, [transactions, categoryLookup]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <article className="h-full rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
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
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-3 transition-colors duration-300 hover:border-[var(--accent)]/40 hover:bg-[var(--surface-1)]/90 dark:bg-[var(--surface-2)]"
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
                  {transaction.categoryIcon} {transaction.categoryName} — {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  transaction.type === "income" ? "text-[var(--success)]" : "text-[var(--danger)]"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default DashboardRecentActivityCard;
