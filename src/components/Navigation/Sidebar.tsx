import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import { toggleSidebar } from "../../redux/nav_slice";
import { useAppDispatch } from "../../hook/redux_hook";
import type { RootState } from "../../redux/store";

const formatCurrency = (value: number) => {
  const absolute = Math.abs(value);
  const useCompact = absolute >= 1_000_000_000;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: useCompact ? "compact" : "standard",
    maximumFractionDigits: useCompact ? 2 : 0,
  }).format(value);
};

const formatFullCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSelector((state: RootState) => state.nav.isOpen);
  const transactions = useSelector((state: RootState) => state.transaction.items);

  const { balance, income, expense, savingsRate } = useMemo(() => {
    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        }
        if (transaction.type === "expense") {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );

    const netBalance = summary.income - summary.expense;
    const rate =
      summary.income === 0 ? 0 : Math.max(0, ((summary.income - summary.expense) / summary.income) * 100);

    return {
      balance: netBalance,
      income: summary.income,
      expense: summary.expense,
      savingsRate: rate,
    };
  }, [transactions]);

  return (
    <>
      <motion.aside
        initial={{ width: isOpen ? 280 : 96 }}
        animate={{ width: isOpen ? 280 : 96 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative hidden h-screen flex-col border-r border-[var(--border-soft)] bg-[var(--surface-0)]/98 pb-6 transition-colors duration-300 dark:bg-[var(--surface-card)]/95 lg:flex"
      >
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/15 text-sm font-semibold text-[var(--accent)]">
              FT
            </div>
            {isOpen && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">FinTrack</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Personal Finance</p>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => dispatch(toggleSidebar())}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 dark:bg-[var(--surface-2)]"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <Navbar orientation="vertical" />
        </div>

        <div className="border-t border-[var(--border-soft)] px-4 pt-4">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Quick Summary</p>
            <p
              className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
              title={formatFullCurrency(balance)}
            >
              {formatCurrency(balance)}
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <p className="flex items-center justify-between">
                <span>Income</span>
                <span className="font-semibold text-[var(--success)]" title={formatFullCurrency(income)}>
                  +{formatCurrency(income)}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span>Expense</span>
                <span className="font-semibold text-[var(--danger)]" title={formatFullCurrency(expense)}>
                  -{formatCurrency(expense)}
                </span>
              </p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate || 0))}%` }}
                aria-label="Savings rate indicator"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Savings rate <span className="font-semibold text-[var(--text-secondary)]">{Math.round(savingsRate)}%</span>
            </p>
          </div>
        </div>
      </motion.aside>

      <motion.nav
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-40 w-[92%] max-w-lg -translate-x-1/2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-0)]/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden"
        aria-label="Primary navigation"
      >
        <Navbar orientation="mobile" />
      </motion.nav>
    </>
  );
};

export default Sidebar;