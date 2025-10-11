import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Activity, ShieldCheck, TrendingUp } from "lucide-react";
import type { RootState } from "../../../redux/store";

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const WINDOW_DAYS = 90;

const DashboardCashFlowForecastCard = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);

  const forecast = useMemo(() => {
    if (transactions.length === 0) {
      return {
        projectedNet: 0,
        dailyIncome: 0,
        dailyExpense: 0,
        balance: 0,
        coverageRatio: 0,
        trendLabel: "No data yet",
      };
    }

    const now = Date.now();
    const windowStart = now - WINDOW_DAYS * MS_IN_DAY;

    let windowIncome = 0;
    let windowExpense = 0;
    let earliest = now;

    transactions.forEach((transaction) => {
      const timestamp = new Date(transaction.date).getTime();
      if (!Number.isNaN(timestamp) && timestamp >= windowStart) {
        earliest = Math.min(earliest, timestamp);
        if (transaction.type === "income") {
          windowIncome += transaction.amount;
        } else {
          windowExpense += transaction.amount;
        }
      }
    });

    const daysCovered = Math.max(1, Math.ceil((now - earliest) / MS_IN_DAY));
    const coverageRatio = Math.min(1, daysCovered / WINDOW_DAYS);
    const dailyIncome = windowIncome / daysCovered;
    const dailyExpense = windowExpense / daysCovered;
    const projectedNet = (dailyIncome - dailyExpense) * 30;
    const balance = transactions.reduce(
      (acc, transaction) => acc + (transaction.type === "income" ? transaction.amount : -transaction.amount),
      0,
    );

    const trendLabel =
      projectedNet >= 0
        ? "Projected surplus"
        : coverageRatio < 0.4
          ? "Limited data — add more records"
          : "Projected shortfall";

    return {
      projectedNet,
      dailyIncome,
      dailyExpense,
      balance,
      coverageRatio,
      trendLabel,
    };
  }, [transactions]);

  const formatCurrency = (value: number, maximumFractionDigits = 0) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits,
    }).format(value);

  const netPositive = forecast.projectedNet >= 0;
  const confidence = Math.round(forecast.coverageRatio * 100);
  const burnRate = forecast.dailyExpense * 30;
  const runway =
    forecast.dailyExpense === 0
      ? "∞"
      : `${Math.max(0, Math.round(forecast.balance / forecast.dailyExpense))} days`;

  return (
    <article className="h-full rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Forward look</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">30-day cash flow forecast</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Based on the last {WINDOW_DAYS} days of activity, updated automatically.
          </p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            netPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          }`}
          aria-hidden="true"
        >
          {netPositive ? <TrendingUp className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
        </span>
      </header>

      <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)]/70 p-5 text-sm dark:bg-[var(--surface-2)]/70">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{forecast.trendLabel}</p>
        <p
          className={`mt-2 text-2xl font-semibold ${
            netPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
          }`}
          title={formatCurrency(forecast.projectedNet, 0)}
        >
          {netPositive ? "+" : "-"}
          {formatCurrency(Math.abs(forecast.projectedNet), 0)}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Estimated net position in the next 30 days if current pace holds.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Avg daily inflow</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {formatCurrency(forecast.dailyIncome, 0)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Projected {formatCurrency(forecast.dailyIncome * 30, 0)} / 30 days</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 dark:bg-[var(--surface-2)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Avg daily outflow</p>
          <p className="mt-2 text-lg font-semibold text-rose-500">
            {formatCurrency(forecast.dailyExpense, 0)}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Projected {formatCurrency(burnRate, 0)} / 30 days</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-xs text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Data confidence
          </span>
          <span className="font-semibold text-[var(--text-primary)]">{confidence}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${Math.min(100, confidence)}%` }}
            aria-label="Forecast confidence"
          />
        </div>
        <p className="text-[var(--text-muted)]">
          Balance runway at current burn: <span className="font-semibold text-[var(--text-primary)]">{runway}</span>
        </p>
      </div>
    </article>
  );
};

export default DashboardCashFlowForecastCard;
