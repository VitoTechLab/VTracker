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
    if (!path || path === "") {
      return "Dashboard";
    }

    return path
      .split("/")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" • ");
  }, [location.pathname]);

  const themeLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <div className="relative flex min-h-screen bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors duration-500 dark:bg-[#020617]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[var(--accent-strong)] blur-3xl" />
        <div className="absolute bottom-[-18rem] left-[-12rem] h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <Sidebar />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] bg-[var(--surface-0)]/85 px-6 py-5 backdrop-blur-xl transition-colors duration-500 dark:border-[var(--border-soft)]/60 dark:bg-[var(--surface-card)]/85">
          <div className="min-w-[180px]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Overview</p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{pageTitle}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Stay on top of your money with real-time analytics.</p>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden min-w-[240px] max-w-md flex-1 items-center md:flex">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search transactions, categories, notes…"
                className="w-full rounded-full border border-transparent bg-[var(--surface-1)]/70 px-11 py-2 text-sm text-[var(--text-primary)] shadow-sm outline-none ring-1 ring-transparent transition focus:ring-[var(--accent)]/60 dark:bg-[var(--surface-2)]"
              />
            </div>

            <Link
              to="/transaction"
              className="group hidden items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] md:flex"
            >
              <PlusCircle className="h-4 w-4 text-[var(--accent)] group-hover:scale-105 transition" />
              New Transaction
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)]/60 text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--surface-2)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)]/60 text-[var(--text-secondary)] transition hover:border-[var(--accent)]/60 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] dark:bg-[var(--surface-2)]"
              aria-label={themeLabel}
              title={themeLabel}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>

            <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-1)]/70 px-3 transition dark:bg-[var(--surface-2)]">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent)]/90 via-[#16a34a] to-[#0f172a] shadow-[0_15px_40px_-15px_rgba(57,255,20,0.6)]" />
              <div className="hidden text-left md:block">
                <p className="text-xs font-medium text-[var(--text-secondary)]">Good evening</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Vito</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-7xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
