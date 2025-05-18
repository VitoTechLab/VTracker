import { motion } from "framer-motion";
import { useAppDispatch } from "../../hook/redux_hook";
import { useSelector } from "react-redux";
import { toggleSidebar } from "../../redux/nav_slice";
import Navbar from "./Navbar";
import type { RootState } from "../../redux/store";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSelector((state: RootState) => state.nav.isOpen);

  return (
    <>
      <motion.nav
      initial={{ width: "4vw" }}
      animate={{ width: isOpen ? "20vw" : "4vw" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex md:flex-col min-w-[3rem] bg-gray-800 text-white h-screen p-2 overflow-hidden relative"
    >
      <button
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
        className="absolute top-2 left-2 bg-blue-500 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => dispatch(toggleSidebar())}
      >
        ☰
      </button>
      <div className="mt-10 overflow-y-auto h-full">
        <Navbar />
      </div>
    </motion.nav>

    <motion.nav
      initial={{ width: "4vw" }}
      animate={{ width: isOpen ? "20vw" : "4vw" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="md:hidden fixed bottom-0"
    >
      <button
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
        className="absolute top-2 left-2 bg-blue-500 p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => dispatch(toggleSidebar())}
      >
        ☰
      </button>
      <div className="mt-10 overflow-y-auto h-full">
        <Navbar />
      </div>
    </motion.nav>
    </>
   
  );
};

export default Sidebar;
