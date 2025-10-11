import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { CategoryWithId } from "../../database/queries";
import { useAppDispatch, useAppSelector } from "../../hook/redux_hook";
import { deleteCategory } from "../../redux/category_slice";
import { useCategoryCrud } from "../../hook/useCategoryCrud";

type CategoryFilter = "income" | "expense";

interface TableCategoryProps {
  filter: CategoryFilter;
  onEdit: (category: CategoryWithId) => void;
}

const TableCategory = ({ filter, onEdit }: TableCategoryProps) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.category.items);
  const { removeCategory } = useCategoryCrud();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"alphabetical" | "recent">("alphabetical");

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const scoped = categories.filter((category) => category.type === filter);

    const searched = scoped.filter((category) => {
      if (!term) {
        return true;
      }
      return (
        category.name.toLowerCase().includes(term) ||
        category.icon?.toLowerCase().includes(term)
      );
    });

    const sorted = searched.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }

      return b.id - a.id;
    });

    return sorted;
  }, [categories, filter, searchTerm, sortBy]);

  const handleRemove = async (category: CategoryWithId) => {
    try {
      const success = await removeCategory(category.id);
      if (success) {
        dispatch(deleteCategory(category.id));
        toast.success("Category removed successfully.");
      } else {
        toast.error("Failed to remove category.");
      }
    } catch (cause) {
      console.error(cause);
      toast.error("An error occurred while removing the category.");
    }
  };

  return (
    <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)]/85 p-6 shadow-[0_35px_90px_-60px_rgba(15,23,42,0.55)] transition-colors duration-500 dark:bg-[var(--surface-card)]/85">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Category listing</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            {filter === "income" ? "Income categories" : "Expense categories"}
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Organise your ledger with expressive emoji categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search categories"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-60 rounded-full border border-transparent bg-[var(--surface-1)]/80 pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] outline-none ring-1 ring-transparent transition focus:ring-[var(--accent)]/60 dark:bg-[var(--surface-2)]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="rounded-full border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] outline-none transition focus:border-[var(--accent)]/60 focus:text-[var(--accent)] dark:bg-[var(--surface-2)]"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="recent">Recently created</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {filteredCategories.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[var(--surface-2)] bg-[var(--surface-1)]/70 px-6 py-10 text-center text-sm text-[var(--text-muted)] dark:bg-[var(--surface-2)]/65">
            No categories found. Create a new one to start grouping transactions.
          </div>
        )}

        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--surface-2)] bg-[var(--surface-1)]/80 px-5 py-4 text-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-1)]/95 dark:bg-[var(--surface-2)]/80"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl" aria-hidden="true">
                {category.icon || "-"}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{category.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {category.type === "income" ? "Income" : "Expense"} category
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--surface-2)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="Edit category"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(category)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--surface-2)] text-[var(--danger)] transition hover:border-[var(--danger)]/60 hover:bg-[var(--danger)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]/70"
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TableCategory;
