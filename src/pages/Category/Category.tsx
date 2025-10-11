import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FolderPlus, PlusCircle } from "lucide-react";
import { useAppSelector } from "../../hook/redux_hook";
import Modal from "../../components/Modal/Modal";
import CategoryForm from "../../components/Form/CategoryForm";
import TableCategory from "../../components/Table/TableCategory";
import { useModal } from "../../hook/useModal";
import type { CategoryWithId } from "../../database/queries";

type CategoryFilter = "income" | "expense";

const filterOptions: { id: CategoryFilter; label: string }[] = [
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
];

const Category = () => {
  const categories = useAppSelector((state) => state.category.items);
  const { openModal, formType, editId, handleOpenModal, handleCloseModal } = useModal();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("income");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const summary = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        if (category.type === "income") {
          acc.income += 1;
        } else {
          acc.expense += 1;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [categories]);

  const activeDescription =
    activeFilter === "income"
      ? "Create smart tags to classify your cash inflows and find trends faster."
      : "Track spending buckets to highlight leaks and optimise your budget.";

  const handleCreateCategory = (type: CategoryFilter) => {
    handleOpenModal(type);
  };

  const handleEditCategory = (category: CategoryWithId) => {
    handleOpenModal(category.type as CategoryFilter, category.id);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMobileCreateCategory = (type: CategoryFilter) => {
    handleCreateCategory(type);
    setIsMobileMenuOpen(false);
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-0)]/85 p-6 shadow-[0_35px_90px_-60px_rgba(15,23,42,0.55)] transition-colors duration-500 dark:bg-[var(--surface-card)]/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Taxonomy</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Categories</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{activeDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-2 rounded-full border border-[var(--surface-2)] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {summary.income} income categories
              </span>
              <span className="flex items-center gap-2 rounded-full border border-[var(--surface-2)] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                {summary.expense} expense categories
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)]/70 p-1 dark:bg-[var(--surface-2)] sm:flex sm:w-auto sm:items-center sm:gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveFilter(option.id)}
                  className={`flex items-center justify-center gap-2 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition sm:px-4 sm:text-xs ${
                    activeFilter === option.id
                      ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((previous) => !previous)}
                className="flex w-full items-center justify-between gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)] dark:bg-[var(--surface-2)]"
                aria-expanded={isMobileMenuOpen}
              >
                <span>New category</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isMobileMenuOpen && (
                <div className="absolute inset-x-0 z-10 mt-2 space-y-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-0)] p-2 shadow-lg dark:bg-[var(--surface-card)]">
                  <button
                    type="button"
                    onClick={() => handleMobileCreateCategory("income")}
                    className="flex w-full items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-500 transition hover:border-emerald-400 hover:bg-emerald-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add income category
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileCreateCategory("expense")}
                    className="flex w-full items-center gap-2 rounded-xl border border-rose-400/50 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-500 transition hover:border-rose-400 hover:bg-rose-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Add expense category
                  </button>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => handleCreateCategory("income")}
                className="flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-500 transition hover:border-emerald-400 hover:bg-emerald-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              >
                <PlusCircle className="h-4 w-4" />
                Add income category
              </button>
              <button
                type="button"
                onClick={() => handleCreateCategory("expense")}
                className="flex items-center gap-2 rounded-full border border-rose-400/60 bg-rose-400/15 px-4 py-2 text-sm font-medium text-rose-500 transition hover:border-rose-400 hover:bg-rose-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
              >
                <FolderPlus className="h-4 w-4" />
                Add expense category
              </button>
            </div>
          </div>
        </div>
      </header>

      <TableCategory filter={activeFilter} onEdit={handleEditCategory} />

      <Modal
        isOpen={openModal}
        onClosed={handleCloseModal}
        title={formType ? `Manage ${formType} category` : "Manage category"}
      >
        {formType && (
          <CategoryForm type={formType} editId={editId} onClosed={handleCloseModal} />
        )}
      </Modal>
    </section>
  );
};

export default Category;
