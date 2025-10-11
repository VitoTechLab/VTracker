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
  { label: "Dashboard", link: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Transactions", link: "/transaction", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { label: "Categories", link: "/category", icon: <FolderKanban className="h-4 w-4" /> },
  { label: "Statistics", link: "/statistic", icon: <ChartPie className="h-4 w-4" /> },
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

  const baseItemClassesVertical = isOpen
    ? "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200"
    : "group flex items-center justify-center rounded-xl p-2 text-sm font-medium transition-colors duration-200";

  const baseItemClassesMobile =
    "group flex flex-1 flex-col items-center gap-1 text-xs font-medium transition-colors duration-200";

  const renderVerticalNav = () => (
    <ul className={`flex flex-col gap-2 ${isOpen ? "px-2" : "px-1"}`}>
      {navItems.map((item, index) => {
        const isActive = selectedMenu === index;
        const iconWrapperClasses = (() => {
          const sizeClasses = isOpen ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl";
          const activeClasses = isActive
            ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
            : "border-transparent bg-[var(--surface-1)] text-[var(--text-secondary)] group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)] dark:bg-[var(--surface-2)]";
          return `flex ${sizeClasses} items-center justify-center border transition-colors duration-200 ${activeClasses}`;
        })();
        const itemStateClasses = isActive
          ? "bg-[var(--accent)]/12 text-[var(--text-primary)]"
          : isOpen
            ? "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] dark:hover:bg-[var(--surface-2)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";

        return (
          <li key={item.label}>
            <NavLink
              to={item.link}
              onClick={() => dispatch(setSelectedMenu(index))}
              aria-current={isActive ? "page" : undefined}
              className={`${baseItemClassesVertical} ${itemStateClasses}`}
              title={isOpen ? undefined : item.label}
            >
              <span className={iconWrapperClasses}>
                {item.icon}
              </span>
              {isOpen && <span>{item.label}</span>}
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
                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "border-transparent bg-[var(--surface-1)] text-[var(--text-secondary)] dark:bg-[var(--surface-2)]"
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
