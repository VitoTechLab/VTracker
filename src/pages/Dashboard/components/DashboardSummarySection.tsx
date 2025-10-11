import { type ReactNode, useMemo } from "react";
import { ArrowUpRight, Gauge, PiggyBank, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import IconWrapper from "../../../components/Icon/IconWrapper";

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

type SmallCard = {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  fractionDigits?: number;
  delta: number;
  deltaLabel: string;
  icon: ReactNode;
  tone: "positive" | "negative" | "info" | "neutral";
  isPercentage?: boolean;
  subLabel: string;
};

const DashboardSummarySection = () => {
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
      dailyBurn === 0 ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(balance / dailyBurn));
    const netChange = accumulator.currentWindowNet - accumulator.previousWindowNet;
    const netChangePercent =
      accumulator.previousWindowNet === 0 ? 0 : (netChange / Math.abs(accumulator.previousWindowNet)) * 100;
    const incomeDelta = accumulator.currentIncome - accumulator.previousIncome;
    const expenseDelta = accumulator.currentExpense - accumulator.previousExpense;

    return {
      balance,
      totalIncome: accumulator.totalIncome,
      totalExpense: accumulator.totalExpense,
      averageTransaction,
      savingsRate,
      expenseToIncomeRatio,
      runwayDays: Number.isFinite(runwayDays) ? runwayDays : 0,
      incomeDelta,
      expenseDelta,
      netChange,
      netChangePercent,
      recentIncome: accumulator.currentIncome,
      recentExpense: accumulator.currentExpense,
    };
  }, [transactions]);

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

  const formatDelta = (value: number) => `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value), 0)}`;

  const smallCards: SmallCard[] = [
    {
      id: "avg-transaction",
      label: "Average transaction",
      value: formatCurrency(summary.averageTransaction, 0),
      rawValue: summary.averageTransaction,
      delta: summary.netChangePercent,
      deltaLabel: `${summary.netChangePercent >= 0 ? "+" : "-"}${Math.abs(summary.netChangePercent).toFixed(1)}% vs prev`,
      icon: <TrendingUp className="h-5 w-5" />,
      tone: "info",
      subLabel: "Average value across all records",
    },
    {
      id: "runway",
      label: "Runway estimate",
      value: Number.isFinite(summary.runwayDays) ? `${summary.runwayDays} days` : "∞",
      rawValue: summary.runwayDays,
      delta: summary.netChange,
      deltaLabel: `${summary.netChange >= 0 ? "+" : "-"}${formatCurrency(Math.abs(summary.netChange), 0)} vs prev`,
      icon: <Gauge className="h-5 w-5" />,
      tone: summary.runwayDays >= 60 ? "positive" : summary.runwayDays >= 30 ? "info" : "negative",
      subLabel: "Projected days until balance hits zero",
    },
    {
      id: "savings",
      label: "Savings rate",
      value: `${summary.savingsRate.toFixed(1)}%`,
      rawValue: summary.savingsRate,
      fractionDigits: 1,
      delta: summary.recentIncome - summary.recentExpense,
      deltaLabel: `${summary.recentIncome - summary.recentExpense >= 0 ? "+" : "-"}${formatCurrency(
        Math.abs(summary.recentIncome - summary.recentExpense),
        0,
      )} last 30d`,
      icon: <PiggyBank className="h-5 w-5" />,
      tone: summary.savingsRate >= 20 ? "positive" : summary.savingsRate >= 10 ? "info" : "negative",
      isPercentage: true,
      subLabel: "Income retained after expenses",
    },
    {
      id: "expense-ratio",
      label: "Expense to income",
      value: `${summary.expenseToIncomeRatio.toFixed(1)}%`,
      rawValue: summary.expenseToIncomeRatio,
      fractionDigits: 1,
      delta: summary.expenseDelta,
      deltaLabel: `${summary.expenseDelta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(summary.expenseDelta), 0)} vs prev`,
      icon: <ArrowUpRight className="h-5 w-5" />,
      tone: summary.expenseToIncomeRatio <= 70 ? "positive" : summary.expenseToIncomeRatio <= 90 ? "info" : "negative",
      isPercentage: true,
      subLabel: "Share of income used for spending",
    },
  ];

  const toneStyles: Record<SmallCard["tone"], { border: string; icon: string }> = {
    positive: {
      border: "border-emerald-200/60",
      icon: "bg-emerald-100 text-emerald-600",
    },
    negative: {
      border: "border-rose-200/60",
      icon: "bg-rose-100 text-rose-600",
    },
    info: {
      border: "border-sky-200/60",
      icon: "bg-sky-100 text-sky-600",
    },
    neutral: {
      border: "border-[var(--border-soft)]",
      icon: "bg-[var(--surface-1)] text-[var(--accent)]",
    },
  };

  return (
    <section className="grid gap-6 lg:grid-cols-12" aria-label="Financial summary">
      <article className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-8 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)] lg:col-span-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Total balance</p>
            <p
              className="mt-3 text-4xl font-semibold text-[var(--text-primary)]"
              title={formatFullCurrency(summary.balance)}
            >
              {formatCurrency(summary.balance)}
            </p>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Balance change{" "}
              <span
                className={`font-semibold ${summary.netChange >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                {formatDelta(summary.netChange)}
              </span>{" "}
              vs previous 30 days
            </p>
          </div>
          <IconWrapper>
            <PiggyBank className="h-6 w-6 text-[var(--accent)]" />
          </IconWrapper>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Savings rate</span>
            <span>{summary.savingsRate.toFixed(0)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate || 0))}%` }}
              aria-label="Savings rate progress"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)]/70 p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]/70">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Income to date</p>
            <p
              className="mt-2 text-lg font-semibold text-[var(--text-primary)]"
              title={formatFullCurrency(summary.totalIncome)}
            >
              {formatCurrency(summary.totalIncome)}
            </p>
            <p className={`mt-1 text-xs font-medium ${summary.incomeDelta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {formatDelta(summary.incomeDelta)}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)]/70 p-4 transition-colors duration-300 dark:bg-[var(--surface-2)]/70">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Expenses to date</p>
            <p
              className="mt-2 text-lg font-semibold text-[var(--text-primary)]"
              title={formatFullCurrency(summary.totalExpense)}
            >
              {formatCurrency(summary.totalExpense)}
            </p>
            <p className={`mt-1 text-xs font-medium ${summary.expenseDelta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {formatDelta(summary.expenseDelta)}
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
        {smallCards.map((card) => {
          const tone = toneStyles[card.tone];
          const valueTitle = card.isPercentage
            ? `${card.rawValue.toFixed(card.fractionDigits ?? 0)}%`
            : formatFullCurrency(card.rawValue, card.fractionDigits ?? 0);

          return (
            <article
              key={card.id}
              className={`rounded-3xl border bg-[var(--surface-0)] p-5 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)] ${tone.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]" title={valueTitle}>
                    {card.value}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      card.delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {card.deltaLabel}
                  </p>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">{card.subLabel}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}`} aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardSummarySection;
