import { Outlet } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-auto">
        <Sidebar />
      </aside>

      <main
        className="flex-1 flex overflow-hidden bg-gray-200"
        role="main"
        aria-label="Main content"
      >
        <section className="flex-1 bg-white m-3 overflow-y-auto shadow-lg rounded-xl">
          <div className="mx-8 my-5 w-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Layout;
