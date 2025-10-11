import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCategoryCrud } from "../../hook/useCategoryCrud";
import { useAppDispatch } from "../../hook/redux_hook";
import { addCategory, editCategory } from "../../redux/category_slice";
import { emojiOptions } from "../../constants/emojiOptions";

interface CategoryFormProps {
  type: "income" | "expense";
  editId?: number | null;
  onClosed: () => void;
}

const CategoryForm = ({ type, onClosed, editId }: CategoryFormProps) => {
  const dispatch = useAppDispatch();
  const { getByIdCategory, insertCategory, updateCategory } = useCategoryCrud();

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) {
      return;
    }

    try {
      const category = getByIdCategory(Number(editId));
      if (category) {
        setFormData({
          name: category.name ?? "",
          icon: category.icon ?? "",
        });
      }
    } catch (cause) {
      console.error("Failed to load category", cause);
    }
  }, [editId, getByIdCategory]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const { name, icon } = formData;

    if (!name || !icon) {
      setError("Please provide both a name and an icon.");
      return;
    }

    try {
      if (editId) {
        const success = await updateCategory({
          ...formData,
          type,
          id: Number(editId),
        });

        if (success) {
          dispatch(
            editCategory({
              ...formData,
              type,
              id: Number(editId),
            }),
          );
          toast.success("Category updated successfully.");
        } else {
          toast.error("Failed to update category.");
        }
      } else {
        const insertId = insertCategory({
          ...formData,
          type,
        });

        if (insertId) {
          dispatch(
            addCategory({
              ...formData,
              type,
              id: Number(insertId),
            }),
          );
          toast.success("Category added successfully.");
        } else {
          toast.error("Failed to add category.");
        }
      }

      onClosed();
    } catch (cause) {
      console.error(cause);
      toast.error("Something went wrong.");
    }
  };

  const isFormValid = Boolean(formData.name && formData.icon);
  const accent =
    type === "income"
      ? "focus:ring-emerald-400/50 border-emerald-400/40"
      : "focus:ring-rose-400/50 border-rose-400/40";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 rounded-3xl border border-[var(--border-soft)]/70 bg-[var(--surface-0)]/90 p-6 text-[var(--text-primary)] shadow-[0_30px_90px_-70px_rgba(15,23,42,0.7)] transition-colors duration-500 dark:bg-[var(--surface-card)]/90"
    >
      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {editId ? "Update category" : "Create category"}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          {type === "income" ? "Income" : "Expense"} category
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Group similar transactions for smarter reporting and filtering.
        </p>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-[var(--text-secondary)]">
          Category name <span className="text-[var(--danger)]">*</span>
        </span>
        <input
          id="category-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={type === "income" ? "e.g. Salary, Dividends" : "e.g. Groceries, Utilities"}
          className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accent}`}
          aria-required="true"
        />
      </label>

      <div className="space-y-3 text-sm">
        <span className="block font-semibold text-[var(--text-secondary)]">
          Icon <span className="text-[var(--danger)]">*</span>
        </span>
        <input
          id="category-icon"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          placeholder="Type an emoji (e.g. 💰, 🚗) or paste your own"
          className={`w-full rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent)]/40 dark:bg-[var(--surface-2)] ${accent}`}
          aria-required="true"
        />
        <p className="text-xs text-[var(--text-muted)]">
          Paste your favourite emoji or tap one below so each category stays visual and scannable.
        </p>

        <div className="max-h-52 overflow-y-auto rounded-2xl border border-[var(--surface-2)] bg-[var(--surface-1)]/60 p-3 dark:bg-[var(--surface-2)]/70">
          <div className="grid grid-cols-6 gap-2 text-lg sm:grid-cols-7">
            {emojiOptions.map((option) => {
              const isActive = formData.icon === option.symbol;

              return (
                <button
                  key={`${option.symbol}-${option.label}`}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      icon: option.symbol,
                    }))
                  }
                  className={`flex h-10 items-center justify-center rounded-2xl border text-base transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "border-transparent bg-[var(--surface-0)]/80 text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] dark:bg-[var(--surface-card)]/60"
                  }`}
                  aria-label={`Use icon ${option.symbol}`}
                  title={option.label}
                >
                  <span aria-hidden="true">{option.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!isFormValid}
        whileHover={isFormValid ? { scale: 1.01 } : undefined}
        whileTap={isFormValid ? { scale: 0.99 } : undefined}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_70px_-30px_rgba(57,255,20,0.5)] transition ${
          !isFormValid
            ? "cursor-not-allowed bg-slate-400/30 text-slate-500"
            : type === "income"
              ? "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:via-emerald-500 hover:to-emerald-600"
              : "bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 hover:from-rose-300 hover:via-rose-500 hover:to-rose-600"
        }`}
      >
        {editId ? "Update category" : "Create category"}
      </motion.button>
    </motion.form>
  );
};

export default CategoryForm;
