import type { CategoryInsight } from "../types";
import { formatCurrency, formatFullCurrency } from "../utils/format";

type StatisticCategoryBreakdownProps = {
  income: CategoryInsight[];
  expense: CategoryInsight[];
};

const StatisticCategoryBreakdown = ({ income, expense }: StatisticCategoryBreakdownProps) => (
  <section className="grid gap-6 xl:grid-cols-2">
    <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Top inflows</p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Income by category</h3>
      </header>

      <div className="mt-4 space-y-3">
        {income.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-6 text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]">
            Record income transactions to see category insights.
          </p>
        )}

        {income.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {category.icon || "-"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{category.percentage.toFixed(1)}% of income</p>
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
        {expense.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-6 text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]">
            Record expense transactions to evaluate spending categories.
          </p>
        )}

        {expense.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {category.icon || "-"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{category.percentage.toFixed(1)}% of expense</p>
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
);

export default StatisticCategoryBreakdown;
