import { useMemo, useState } from "react";
import { ArrowLeftRight, PlusCircle } from "lucide-react";
import { useAppSelector } from "../../hook/redux_hook";
import TableTransaction from "../../components/Table/TableTransaction";
import Modal from "../../components/Modal/Modal";
import TransactionForm from "../../components/Form/TransactionForm";
import { useModal } from "../../hook/useModal";
import type { TransactionWithId } from "../../database/queries";

type TransactionFilter = "all" | "income" | "expense";

const filterOptions: { id: TransactionFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const Transaction = () => {
  const { openModal, formType, editId, handleOpenModal, handleCloseModal } = useModal();
  const transactions = useAppSelector((state) => state.transaction.items);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("all");

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
          acc.incomeCount += 1;
        } else {
          acc.totalExpense += transaction.amount;
          acc.expenseCount += 1;
        }

        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
      },
    );
  }, [transactions]);

  const activeDescription = useMemo(() => {
    switch (activeFilter) {
      case "income":
        return "Showing only income records from payroll, freelance or side gigs.";
      case "expense":
        return "Tracking expense activity including bills, lifestyle, and savings contributions.";
      default:
        return "Review and manage every transaction across your accounts.";
    }
  }, [activeFilter]);

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

  const handleCreateTransaction = (type: "income" | "expense") => {
    handleOpenModal(type);
  };

  const handleEditTransaction = (transaction: TransactionWithId) => {
    handleOpenModal(transaction.type as "income" | "expense", transaction.id);
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Cashflow control</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Transactions</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{activeDescription}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {summary.incomeCount} incomes totaling
                <span className="font-semibold text-[var(--text-secondary)]" title={formatFullCurrency(summary.totalIncome)}>
                  {formatCurrency(summary.totalIncome)}
                </span>
              </span>
              <span className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {summary.expenseCount} expenses totaling
                <span className="font-semibold text-[var(--text-secondary)]" title={formatFullCurrency(summary.totalExpense)}>
                  {formatCurrency(summary.totalExpense)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] p-1 dark:bg-[var(--surface-2)]">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveFilter(option.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    activeFilter === option.id
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  aria-pressed={activeFilter === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCreateTransaction("income")}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-500/60 hover:bg-emerald-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              >
                <PlusCircle className="h-4 w-4" />
                Add income
              </button>
              <button
                type="button"
                onClick={() => handleCreateTransaction("expense")}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-500/60 hover:bg-rose-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Add expense
              </button>
            </div>
          </div>
        </div>
      </header>

      <TableTransaction filter={activeFilter} onEdit={handleEditTransaction} />

      <Modal
        isOpen={openModal}
        onClosed={handleCloseModal}
        title={formType ? `Manage ${formType === "income" ? "Income" : "Expense"}` : "Manage transaction"}
      >
        {formType && (
          <TransactionForm
            type={formType}
            editId={editId}
            onClosed={handleCloseModal}
          />
        )}
      </Modal>
    </section>
  );
};

export default Transaction;
