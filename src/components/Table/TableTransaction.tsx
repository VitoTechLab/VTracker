import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { TransactionWithId } from "../../database/queries";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import { deleteTransaction } from "../../redux/transaction_slice";
import { useTransactionCrud } from "../../hook/useTransactionCrud";

type TransactionFilter = "all" | "income" | "expense";

interface TableTransactionProps {
  filter: TransactionFilter;
  onEdit: (transaction: TransactionWithId) => void;
}

const ITEMS_PER_PAGE = 7;

const TableTransaction = ({ filter, onEdit }: TableTransactionProps) => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transaction.items);
  const categories = useAppSelector((state) => state.category.items);
  const { removeTransaction } = useTransactionCrud();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amountDesc" | "amountAsc">("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm, sortBy]);

  const categoryLookup = useMemo(() => {
    const map = new Map<number, { name: string; icon: string }>();
    categories.forEach((category) => {
      map.set(category.id, { name: category.name, icon: category.icon });
    });
    return map;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = transactions.filter((transaction) => {
      const matchesFilter = filter === "all" || transaction.type === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const category = categoryLookup.get(transaction.categoryId);
      return (
        transaction.name.toLowerCase().includes(term) ||
        (category?.name?.toLowerCase().includes(term) ?? false)
      );
    });

    const sorted = filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "amountDesc") {
        return b.amount - a.amount;
      }
      return a.amount - b.amount;
    });

    return sorted;
  }, [transactions, filter, searchTerm, sortBy, categoryLookup]);

  const summary = useMemo(() => {
    const aggregate = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
          acc.incomeCount += 1;
        } else {
          acc.expense += transaction.amount;
          acc.expenseCount += 1;
        }

        return acc;
      },
      { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 },
    );

    return {
      ...aggregate,
      net: aggregate.income - aggregate.expense,
    };
  }, [filteredTransactions]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));

  const paginatedTransactions = useMemo(
    () =>
      filteredTransactions.slice(
        (page - 1) * ITEMS_PER_PAGE,
        (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [filteredTransactions, page],
  );

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

  const handleRemove = async (transaction: TransactionWithId) => {
    try {
      const success = await removeTransaction(transaction.id);
      if (success) {
        dispatch(deleteTransaction(transaction.id));
        toast.success(`Removed ${transaction.type === "income" ? "income" : "expense"} successfully.`);
      } else {
        toast.error("Failed to remove transaction.");
      }
    } catch (error) {
      toast.error("An error occurred while removing the transaction.");
      console.error(error);
    }
  };

  const tableTitle =
    filter === "all"
      ? "All activity"
      : filter === "income"
        ? "Income stream"
        : "Expense ledger";

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 shadow-sm transition-colors duration-300 dark:bg-[var(--surface-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{tableTitle}</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Transaction table</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {summary.incomeCount} incomes
              {summary.income > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="font-semibold text-[var(--text-secondary)]" title={formatFullCurrency(summary.income)}>
                    {formatCurrency(summary.income)}
                  </span>
                </>
              )}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {summary.expenseCount} expenses
              {summary.expense > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="font-semibold text-[var(--text-secondary)]" title={formatFullCurrency(summary.expense)}>
                    {formatCurrency(summary.expense)}
                  </span>
                </>
              )}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1 dark:bg-[var(--surface-2)]">
              Net
              <span
                className={`font-semibold ${summary.net >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                title={formatFullCurrency(summary.net)}
              >
                {formatCurrency(summary.net)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="search"
              placeholder="Search by name or category"
              className="w-64 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/20 dark:bg-[var(--surface-2)]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] outline-none transition focus:border-[var(--accent)]/60 focus:text-[var(--accent)] dark:bg-[var(--surface-2)]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amountDesc">Highest amount</option>
            <option value="amountAsc">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--border-soft)]">
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
          <table className="min-w-full divide-y divide-[var(--border-soft)] text-sm">
            <thead className="bg-[var(--surface-1)] text-[var(--text-muted)] dark:bg-[var(--surface-2)]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-medium uppercase tracking-[0.16em]">Name</th>
                <th scope="col" className="px-6 py-3 text-left font-medium uppercase tracking-[0.16em]">Category</th>
                <th scope="col" className="px-6 py-3 text-left font-medium uppercase tracking-[0.16em]">Date</th>
                <th scope="col" className="px-6 py-3 text-right font-medium uppercase tracking-[0.16em]">Amount</th>
                <th scope="col" className="px-6 py-3 text-right font-medium uppercase tracking-[0.16em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] bg-[var(--surface-0)] dark:bg-[var(--surface-card)]">
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
                    No transactions match your filters. Try adjusting the search criteria.
                  </td>
                </tr>
              )}
              {paginatedTransactions.map((transaction) => {
                const category = categoryLookup.get(transaction.categoryId);
                const isIncome = transaction.type === "income";
                const parsedDate = new Date(transaction.date);
                const formattedDate = Number.isNaN(parsedDate.getTime())
                  ? "—"
                  : new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(parsedDate);
                return (
                  <tr
                    key={transaction.id}
                    className="transition-colors duration-200 hover:bg-[var(--surface-1)]/65 dark:hover:bg-[var(--surface-2)]/75"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-xl border text-xs font-semibold ${
                            isIncome
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {isIncome ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{transaction.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{isIncome ? "Income" : "Expense"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {category ? `${category.icon} ${category.name}` : "Uncategorised"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[var(--text-secondary)]">{formattedDate}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold">
                      <span
                        className={`${isIncome ? "text-[var(--success)]" : "text-[var(--danger)]"} tabular-nums`}
                        title={`${isIncome ? "+" : "-"}${formatFullCurrency(transaction.amount)}`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(transaction)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
                          aria-label="Edit transaction"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(transaction)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--danger)] transition hover:border-[var(--danger)]/60 hover:bg-[var(--danger)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]/60"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <p>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(page * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} records
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                page === 1
                  ? "cursor-not-allowed border-[var(--surface-2)] text-[var(--text-muted)]"
                  : "border-[var(--border-soft)]/70 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
              }`}
            >
              Prev
            </button>
            <span className="text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                page === totalPages
                  ? "cursor-not-allowed border-[var(--surface-2)] text-[var(--text-muted)]"
                  : "border-[var(--border-soft)]/70 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TableTransaction;
