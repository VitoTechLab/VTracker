import { useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, MoonStar, PlusCircle, Search, Sun } from "lucide-react";
import Sidebar from "../Navigation/Sidebar";
import { useTheme } from "../../hook/useTheme";

const Layout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const pageTitle = useMemo(() => {
    const path = location.pathname.replace(/^\//, "");
    if (!path) {
      return "Dashboard";
    }

    return path
      .split("/")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" / ");
  }, [location.pathname]);

  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <div className="flex min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--surface-0)]/95 px-6 py-4 backdrop-blur-md transition-colors duration-300 dark:bg-[var(--surface-card)]/85">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-[180px]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Overview</p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{pageTitle}</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Stay on top of your money with real-time analytics.</p>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
              <div className="relative hidden min-w-[240px] max-w-md flex-1 items-center md:flex">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search transactions, categories, notes…"
                  className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-9 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/70 focus:ring-2 focus:ring-[var(--accent)]/20 dark:bg-[var(--surface-2)]"
                />
              </div>

              <Link
                to="/transaction"
                className="hidden items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent)]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 md:flex"
              >
                <PlusCircle className="h-4 w-4" />
                New Transaction
              </Link>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/70 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 dark:bg-[var(--surface-2)]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/70 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 dark:bg-[var(--surface-2)]"
                aria-label={themeLabel}
                title={themeLabel}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>

              <div className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 transition dark:bg-[var(--surface-2)]">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                  V
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-medium text-[var(--text-muted)]">Welcome back</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Vito</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;