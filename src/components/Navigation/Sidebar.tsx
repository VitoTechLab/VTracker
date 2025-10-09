import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import { toggleSidebar } from "../../redux/nav_slice";
import { useAppDispatch } from "../../hook/redux_hook";
import type { RootState } from "../../redux/store";

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
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative hidden h-screen flex-col border-r border-[var(--border-soft)]/60 bg-[var(--surface-card)]/70 pb-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition-colors duration-500 lg:flex"
      >
        <div className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--accent)]/60 bg-[var(--accent)]/20 text-[var(--accent)] shadow-[0_15px_40px_-20px_rgba(57,255,20,0.7)]">
              ₣
            </div>
            {isOpen && (
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--text-muted)]">FinTrack</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Personal Finance</p>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => dispatch(toggleSidebar())}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)]/70 bg-[var(--surface-1)]/60 text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--surface-2)]"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto px-2">
          <Navbar orientation="vertical" />
        </div>

        <div className="mx-4 rounded-3xl border border-[var(--accent)]/40 bg-gradient-to-br from-[var(--accent)]/15 via-[var(--surface-1)]/60 to-[var(--surface-0)]/80 p-4 shadow-[0_25px_70px_-45px_rgba(57,255,20,0.6)] transition-colors duration-500 dark:from-[var(--accent)]/20 dark:via-transparent dark:to-[var(--surface-card)]/80">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Quick Summary</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">${balance.toLocaleString()}</p>
          <div className="mt-3 space-y-2 text-xs">
            <p className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Income</span>
              <span className="font-medium text-[var(--success)]">+${income.toLocaleString()}</span>
            </p>
            <p className="flex items-center justify-between text-[var(--text-secondary)]">
              <span>Expense</span>
              <span className="font-medium text-[var(--danger)]">-${expense.toLocaleString()}</span>
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#34d399] transition-all duration-500"
              style={{ width: `${Math.min(100, savingsRate || 0)}%` }}
              aria-label="Savings rate indicator"
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Savings rate <span className="font-semibold text-[var(--text-secondary)]">{savingsRate.toFixed(0)}%</span>
          </p>
        </div>
      </motion.aside>

      <motion.nav
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-40 w-[92%] max-w-lg -translate-x-1/2 rounded-3xl border border-[var(--border-soft)]/60 bg-[var(--surface-card)]/90 p-3 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:hidden"
        aria-label="Primary navigation"
      >
        <Navbar orientation="mobile" />
      </motion.nav>
    </>
  );
};

export default Sidebar;

