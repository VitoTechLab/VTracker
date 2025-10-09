import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTransactionCrud } from "../../hook/useTransactionCrud";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import { addTransaction, editTransaction } from "../../redux/transaction_slice";

interface TransactionFormProps {
  type: "income" | "expense";
  editId?: number | null;
  onClosed: () => void;
}

const formVariants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

const TransactionForm = ({ type, editId, onClosed }: TransactionFormProps) => {
  const dispatch = useAppDispatch();
  const { insertTransaction, updateTransaction, getByIdTransaction } = useTransactionCrud();
  const categories = useAppSelector((state) => state.category.items);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: 0,
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  useEffect(() => {
    if (!editId) {
      return;
    }

    try {
      const transaction = getByIdTransaction(Number(editId));
      if (transaction) {
        setFormData({
          name: transaction.name ?? "",
          categoryId: transaction.categoryId ?? 0,
          amount: transaction.amount ?? 0,
          date: transaction.date ?? new Date().toISOString().split("T")[0],
        });
      }
    } catch (cause) {
      console.error("Failed to load transaction", cause);
    }
  }, [editId, getByIdTransaction]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" || name === "amount" ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { name, categoryId, amount, date } = formData;

    if (!name || !categoryId || !amount || !date) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      if (editId) {
        const success = await updateTransaction({
          ...formData,
          type,
          id: Number(editId),
        });

        if (success) {
          dispatch(
            editTransaction({
              ...formData,
              type,
              id: Number(editId),
            }),
          );
          toast.success("Transaction updated successfully.");
        } else {
          toast.error("Failed to update transaction.");
        }
      } else {
        const insertId = insertTransaction({
          ...formData,
          type,
        });

        if (insertId) {
          dispatch(
            addTransaction({
              ...formData,
              type,
              id: Number(insertId),
            }),
          );
          toast.success("Transaction added successfully.");
        } else {
          toast.error("Failed to add transaction.");
        }
      }

      onClosed();
    } catch (cause) {
      console.error(cause);
      setError("Failed to save transaction. Please try again.");
      toast.error("Something went wrong.");
    }
  };

  const isFormValid = Boolean(formData.name && formData.categoryId && formData.amount && formData.date);
  const accentClass =
    type === "income"
      ? "focus:ring-emerald-400/60 border-emerald-400/40"
      : "focus:ring-rose-400/60 border-rose-400/40";
  const accentButton =
    type === "income"
      ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:via-emerald-500 hover:to-emerald-600"
      : "bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:from-rose-300 hover:via-rose-500 hover:to-rose-600";

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5 rounded-3xl border border-[var(--border-soft)]/70 bg-[var(--surface-0)]/90 p-6 text-[var(--text-primary)] shadow-[0_30px_90px_-70px_rgba(15,23,42,0.7)] transition-colors duration-500 dark:bg-[var(--surface-card)]/90"
      aria-labelledby="transaction-form-title"
    >
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {editId ? "Update transaction" : "Log new transaction"}
        </p>
        <h2 id="transaction-form-title" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          {type === "income" ? "Income" : "Expense"}
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {type === "income"
            ? "Capture inflows like payroll, freelance projects, and passive income."
            : "Track outgoing cash from bills, lifestyle, and savings contributions."}
        </p>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">
            Name <span className="text-[var(--danger)]">*</span>
          </span>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g. Salary, Groceries, Rent"
            className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accentClass}`}
            aria-required="true"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">
            Category <span className="text-[var(--danger)]">*</span>
          </span>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accentClass}`}
            aria-required="true"
          >
            <option value={0} disabled>
              Select a category
            </option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          {availableCategories.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              No categories for this type yet. Create one from the Categories page.
            </p>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">
            Amount <span className="text-[var(--danger)]">*</span>
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
              $
            </span>
            <input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step="0.01"
              value={formData.amount === 0 ? "" : formData.amount}
              onChange={handleChange}
              inputMode="decimal"
              className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 pl-8 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accentClass}`}
              aria-required="true"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">Use positive values. We handle signage based on the type.</p>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">
            Date <span className="text-[var(--danger)]">*</span>
          </span>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accentClass}`}
            aria-required="true"
          />
        </label>
      </div>

      <motion.button
        type="submit"
        disabled={!isFormValid}
        whileHover={isFormValid ? { scale: 1.01 } : undefined}
        whileTap={isFormValid ? { scale: 0.99 } : undefined}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_70px_-30px_rgba(57,255,20,0.65)] transition ${
          isFormValid ? accentButton : "cursor-not-allowed bg-slate-400/30 text-slate-500"
        }`}
      >
        {editId ? "Update transaction" : "Add transaction"}
      </motion.button>
    </motion.form>
  );
};

export default TransactionForm;
