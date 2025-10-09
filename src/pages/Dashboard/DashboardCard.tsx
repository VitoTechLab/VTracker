import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Gauge, PiggyBank, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import IconWrapper from "../../components/Icon/IconWrapper";

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

type Summary = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  averageTransaction: number;
  savingsRate: number;
  expenseToIncomeRatio: number;
  runwayDays: number;
  incomeDelta: number;
  expenseDelta: number;
  netChange: number;
  netChangePercent: number;
  recentIncome: number;
  recentExpense: number;
};

const DashboardCard = () => {
  const transactions = useSelector((state: RootState) => state.transaction.items);

  const summary = useMemo<Summary>(() => {
    if (transactions.length === 0) {
      return {
        balance: 0,
        totalIncome: 0,
        totalExpense: 0,
        averageTransaction: 0,
        savingsRate: 0,
        expenseToIncomeRatio: 0,
        runwayDays: 0,
        incomeDelta: 0,
        expenseDelta: 0,
        netChange: 0,
        netChangePercent: 0,
        recentIncome: 0,
        recentExpense: 0,
      };
    }

    const now = Date.now();
    const windowStart = now - THIRTY_DAYS_MS;
    const previousWindowStart = windowStart - THIRTY_DAYS_MS;

    const accumulator = transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount;
        const timestamp = new Date(transaction.date).getTime();
        const inCurrentWindow = !Number.isNaN(timestamp) && timestamp >= windowStart;
        const inPreviousWindow =
          !Number.isNaN(timestamp) && timestamp >= previousWindowStart && timestamp < windowStart;

        acc.count += 1;

        if (transaction.type === "income") {
          acc.totalIncome += amount;
          acc.volume += amount;

          if (inCurrentWindow) {
            acc.currentIncome += amount;
          } else if (inPreviousWindow) {
            acc.previousIncome += amount;
          }
        } else {
          acc.totalExpense += amount;
          acc.volume += amount;

          if (inCurrentWindow) {
            acc.currentExpense += amount;
          } else if (inPreviousWindow) {
            acc.previousExpense += amount;
          }
        }

        if (inCurrentWindow) {
          acc.currentWindowNet += transaction.type === "income" ? amount : -amount;
        } else if (inPreviousWindow) {
          acc.previousWindowNet += transaction.type === "income" ? amount : -amount;
        }

        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        volume: 0,
        count: 0,
        currentIncome: 0,
        currentExpense: 0,
        previousIncome: 0,
        previousExpense: 0,
        currentWindowNet: 0,
        previousWindowNet: 0,
      },
    );

    const balance = accumulator.totalIncome - accumulator.totalExpense;
    const savingsRate =
      accumulator.totalIncome === 0
        ? 0
        : Math.max(0, ((accumulator.totalIncome - accumulator.totalExpense) / accumulator.totalIncome) * 100);
    const averageTransaction = accumulator.count === 0 ? 0 : accumulator.volume / accumulator.count;
    const expenseToIncomeRatio =
      accumulator.totalIncome === 0 ? 0 : (accumulator.totalExpense / accumulator.totalIncome) * 100;
    const dailyBurn = accumulator.currentExpense === 0 ? 0 : accumulator.currentExpense / 30;
    const runwayDays =
      dailyBurn === 0
        ? Number.POSITIVE_INFINITY
        : Math.max(0, Math.floor(balance / dailyBurn));
    const netChange = accumulator.currentWindowNet - accumulator.previousWindowNet;
    const netChangePercent =
      accumulator.previousWindowNet === 0
        ? accumulator.currentWindowNet === 0
          ? 0
          : 100
        : (netChange / Math.abs(accumulator.previousWindowNet)) * 100;

    return {
      balance,
      totalIncome: accumulator.totalIncome,
      totalExpense: accumulator.totalExpense,
      averageTransaction,
      savingsRate,
      expenseToIncomeRatio,
      runwayDays: Number.isFinite(runwayDays) ? runwayDays : 90,
      incomeDelta: accumulator.currentIncome - accumulator.previousIncome,
      expenseDelta: accumulator.currentExpense - accumulator.previousExpense,
      netChange,
      netChangePercent,
      recentIncome: accumulator.currentIncome,
      recentExpense: accumulator.currentExpense,
    };
  }, [transactions]);

  const formatCurrency = (value: number, maximumFractionDigits = 0) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits,
    }).format(value);

  const formatDelta = (value: number) => {
    const prefix = value >= 0 ? "+" : "−";
    return `${prefix}${formatCurrency(Math.abs(value))}`;
  };

  const compactCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  const smallCards = [
    {
      id: "income",
      label: "Cash In (30d)",
      value: formatCurrency(summary.recentIncome),
      delta: summary.incomeDelta,
      deltaLabel: formatDelta(summary.incomeDelta),
      icon: <ArrowDownRight className="h-5 w-5" />,
      accent: "from-emerald-400/15 to-emerald-500/10 text-emerald-500",
      subLabel: `${transactions.filter((t) => t.type === "income").length} income records`,
    },
    {
      id: "expense",
      label: "Cash Out (30d)",
      value: formatCurrency(summary.recentExpense),
      delta: summary.expenseDelta,
      deltaLabel: formatDelta(summary.expenseDelta),
      icon: <ArrowUpRight className="h-5 w-5" />,
      accent: "from-rose-400/15 to-rose-500/10 text-rose-500",
      subLabel: `${transactions.filter((t) => t.type === "expense").length} expense records`,
    },
    {
      id: "average",
      label: "Average Ticket",
      value: formatCurrency(summary.averageTransaction, summary.averageTransaction > 100 ? 0 : 2),
      delta: summary.netChange,
      deltaLabel: `${summary.netChange >= 0 ? "+" : "−"}${compactCurrency(Math.abs(summary.netChange))} net`,
      icon: <TrendingUp className="h-5 w-5" />,
      accent: "from-sky-400/15 to-sky-500/10 text-sky-500",
      subLabel: `Net change vs last month`,
    },
    {
      id: "savings",
      label: "Savings Health",
      value: `${summary.savingsRate.toFixed(0)}%`,
      delta: summary.netChangePercent,
      deltaLabel: `${summary.netChangePercent >= 0 ? "+" : "−"}${Math.abs(summary.netChangePercent).toFixed(1)}%`,
      icon: <Gauge className="h-5 w-5" />,
      accent: "from-lime-400/15 to-lime-500/10 text-lime-500",
      subLabel: `Runway ~${summary.runwayDays} days`,
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-12" aria-label="Financial summary">
      <article className="relative overflow-hidden rounded-3xl border border-[var(--border-soft)]/70 bg-[radial-gradient(circle_at_top,#06111f_0%,#020617_70%)] p-8 text-white shadow-[0_35px_80px_-45px_rgba(15,23,42,0.75)] lg:col-span-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--accent)]/30 blur-3xl" />
          <div className="absolute bottom-[-3rem] left-[-2rem] h-48 w-48 rounded-full bg-sky-500/30 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Total Balance</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">{formatCurrency(summary.balance)}</p>
            <p className="mt-3 text-sm text-slate-400">
              Balance change <span className="font-semibold text-white">{formatDelta(summary.netChange)}</span> vs
              previous 30 days
            </p>
          </div>
          <IconWrapper>
            <PiggyBank className="h-6 w-6 text-[var(--accent)]" />
          </IconWrapper>
        </div>

        <div className="relative mt-6 h-2 rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400"
            style={{ width: `${Math.min(100, summary.savingsRate || 0)}%` }}
            aria-label="Savings rate progress"
          />
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Income to date</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrency(summary.totalIncome)}</p>
            <p className="mt-1 text-xs text-emerald-300">
              {summary.incomeDelta >= 0 ? "▲" : "▼"} {formatDelta(summary.incomeDelta)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Expenses to date</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrency(summary.totalExpense)}</p>
            <p className="mt-1 text-xs text-rose-300">
              {summary.expenseDelta >= 0 ? "▲" : "▼"} {formatDelta(summary.expenseDelta)}
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
        {smallCards.map((card) => (
          <article
            key={card.id}
            className={`group relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)]/80 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.65)] transition-colors duration-500 dark:bg-[var(--surface-card)]/85`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{card.label}</p>
                <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{card.value}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    card.delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {card.deltaLabel}
                </p>
                <p className="mt-3 text-xs text-[var(--text-muted)]">{card.subLabel}</p>
              </div>
              <IconWrapper>{card.icon}</IconWrapper>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardCard;

