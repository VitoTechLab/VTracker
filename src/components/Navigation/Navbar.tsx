import { CreditCard, Home } from "react-feather";
import { FcStatistics } from "react-icons/fc";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hook/redux_hook";
import { setSelectedMenu } from "../../redux/nav_slice";
import type { RootState } from "../../redux/store";
import { BiCategory } from "react-icons/bi";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  link: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: <Home className="w-5 h-5" />, link: "/" },
  { label: "Transaction", icon: <CreditCard className="w-5 h-5" />, link: "/transaction" },
  { label: "Category", icon: <BiCategory className="w-5 h-5" />, link: "/category" },
  { label: "Statistics", icon: <FcStatistics className="w-5 h-5" />, link: "/statistic" },
];

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { isOpen, selectedMenu } = useSelector((state: RootState) => ({
    isOpen: state.nav.isOpen,
    selectedMenu: state.nav.selectedMenu,
  }));

  const location = useLocation();

  return (
    <nav className="mt-6">
      <ul className="flex flex-col space-y-2 w-full">
        {navItems.map((item, index) => {
          const isSelected = selectedMenu === index && location.pathname === item.link;
          const baseClasses = "flex items-center h-8 cursor-pointer";
          const spacing = isOpen ? "justify-around mx-4 px-3" : "justify-center";
          const active =
            isSelected
              ? "bg-white text-black rounded-md"
              : "hover:bg-gray-300 hover:text-black hover:rounded-md";

          return (
            <li key={item.label}>
              <Link
                to={item.link}
                className={`${baseClasses} ${spacing} ${active}`}
                onClick={() => dispatch(setSelectedMenu(index))}
                aria-current={isSelected ? "page" : undefined}
                aria-label={!isOpen ? item.label : undefined}
              >
                <div>{item.icon}</div>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, visibility: "hidden" }}
                    animate={{ opacity: 1, visibility: "visible" }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 text-center"
                  >
                    {item.label}
                  </motion.div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
