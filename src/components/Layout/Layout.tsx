import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../Navigation/Sidebar";

const Layout = () => {
  const location = useLocation();

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

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--surface-0)]/95 px-6 py-4 backdrop-blur-md transition-colors duration-300 dark:bg-[var(--surface-card)]/85">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-[180px]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">Overview</p>
              <h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{pageTitle}</h1>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Stay on top of your money with real-time analytics.</p>
            </div>

            <div className="flex flex-1 items-center justify-end">
              <div className="relative hidden min-w-[200px] max-w-md flex-1 items-center md:flex">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search transactions, categories, notes."
                  className="w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] px-8 py-[0.6rem] text-xs text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/70 focus:ring-2 focus:ring-[var(--accent)]/20 dark:bg-[var(--surface-2)]"
                />
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
