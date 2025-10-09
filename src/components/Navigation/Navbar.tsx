import { useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ArrowLeftRight, ChartPie, FolderKanban, LayoutDashboard } from "lucide-react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hook/redux_hook";
import { setSelectedMenu } from "../../redux/nav_slice";
import type { RootState } from "../../redux/store";

type NavbarOrientation = "vertical" | "mobile";

interface NavbarProps {
  orientation?: NavbarOrientation;
}

interface NavItem {
  label: string;
  link: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Overview", link: "/", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: "Transactions", link: "/transaction", icon: <ArrowLeftRight className="h-[18px] w-[18px]" /> },
  { label: "Categories", link: "/category", icon: <FolderKanban className="h-[18px] w-[18px]" /> },
  { label: "Statistics", link: "/statistic", icon: <ChartPie className="h-[18px] w-[18px]" /> },
];

const Navbar = ({ orientation = "vertical" }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const { isOpen, selectedMenu } = useSelector((state: RootState) => ({
    isOpen: state.nav.isOpen,
    selectedMenu: state.nav.selectedMenu,
  }));

  const location = useLocation();

  useEffect(() => {
    const current = navItems.findIndex((item) => {
      if (item.link === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(item.link);
    });

    if (current !== -1 && current !== selectedMenu) {
      dispatch(setSelectedMenu(current));
    }
  }, [dispatch, selectedMenu, location.pathname]);

  const baseItemClassesVertical =
    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300";

  const baseItemClassesMobile =
    "group flex flex-1 flex-col items-center gap-1 text-xs font-medium transition-all duration-300";

  const renderVerticalNav = () => (
    <ul className="flex flex-col gap-2 px-2">
      {navItems.map((item, index) => {
        const isActive = selectedMenu === index;
        return (
          <li key={item.label}>
            <NavLink
              to={item.link}
              onClick={() => dispatch(setSelectedMenu(index))}
              aria-current={isActive ? "page" : undefined}
              className={`${baseItemClassesVertical} ${
                isActive
                  ? "bg-[var(--accent)]/15 text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(57,255,20,0.35)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)]/60 hover:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-transparent bg-[var(--surface-1)]/60 text-[var(--text-secondary)] group-hover:border-[var(--accent)]/50 group-hover:text-[var(--accent)] dark:bg-[var(--surface-2)]"
                }`}
              >
                {item.icon}
              </span>
              {isOpen && <span>{item.label}</span>}
              {isActive && isOpen && (
                <span className="absolute left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  const renderMobileNav = () => (
    <ul className="flex items-center justify-between gap-2">
      {navItems.map((item, index) => {
        const isActive = selectedMenu === index;
        return (
          <li key={item.label} className="flex flex-1 justify-center">
            <NavLink
              to={item.link}
              aria-label={item.label}
              onClick={() => dispatch(setSelectedMenu(index))}
              className={`${baseItemClassesMobile} ${
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-[18px] border transition-all ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/25 text-[var(--accent)] shadow-[0_10px_25px_-20px_rgba(57,255,20,0.8)]"
                    : "border-transparent bg-[var(--surface-1)]/70 text-[var(--text-secondary)] dark:bg-[var(--surface-2)]"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return orientation === "mobile" ? renderMobileNav() : renderVerticalNav();
};

export default Navbar;
