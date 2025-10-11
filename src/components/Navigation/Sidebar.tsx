import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, MoonStar, PlusCircle, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { toggleSidebar } from "../../redux/nav_slice";
import { useAppDispatch } from "../../hook/redux_hook";
import type { RootState } from "../../redux/store";
import { useTheme } from "../../hook/useTheme";

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
  const { theme, toggleTheme } = useTheme();

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

  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  const expandedWidth = 280;
  const collapsedWidth = 80;

  return (
    <>
      <motion.aside
        initial={{ width: isOpen ? expandedWidth : collapsedWidth }}
        animate={{ width: isOpen ? expandedWidth : collapsedWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative hidden min-h-screen max-h-screen flex-col overflow-hidden border-r border-[var(--border-soft)] bg-[var(--surface-0)]/98 transition-colors duration-300 dark:bg-[var(--surface-card)]/95 lg:flex"
      >
        <div className="flex h-full flex-col">
          <div className="px-4 pt-6 pb-4">
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-[var(--accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
            >
              <img
                src="/vtracker.svg"
                alt="VTracker logo"
                className="h-10 w-10 rounded-xl border border-[var(--accent)]/30 bg-[var(--surface-0)] p-1 dark:bg-[var(--surface-card)]"
              />
              {isOpen && (
                <>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">VTracker</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Expense Tracker</p>
                  </div>
                  <ChevronLeft className="ml-auto h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          <div className="flex-1 px-2 pb-6">
            <Navbar orientation="vertical" />
          </div>

          <div className="space-y-4 border-t border-[var(--border-soft)] px-4 py-4">
            {isOpen && (
              <Link
                to="/transaction"
                aria-label="Create new transaction"
                title="Create new transaction"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-3 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35"
              >
                <PlusCircle className="h-4 w-4" />
                <span>New Transaction</span>
              </Link>
            )}

            {isOpen && (
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] p-4 text-xs text-[var(--text-secondary)] dark:bg-[var(--surface-2)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Quick summary</p>
                <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]" title={formatFullCurrency(balance)}>
                  {formatCurrency(balance)}
                </p>
                <div className="mt-3 space-y-2">
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
                <div className="mt-4 h-1.5 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${Math.min(100, Math.max(0, savingsRate || 0))}%` }}
                    aria-label="Savings rate indicator"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                  Savings rate <span className="font-semibold text-[var(--text-secondary)]">{Math.round(savingsRate)}%</span>
                </p>
              </div>
            )}

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className={`flex items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)]/70 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 dark:bg-[var(--surface-2)] ${
                  isOpen ? "" : "h-9 w-9 px-0"
                }`}
              >
                {theme === "dark" ? <Sun className="h-[14px] w-[14px]" /> : <MoonStar className="h-[14px] w-[14px]" />}
                {isOpen && <span className="text-[11px]">{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
              </button>
            </div>
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
