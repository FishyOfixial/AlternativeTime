import { NavLink, Outlet } from "react-router-dom";
import HeaderBar from "../components/navigation/HeaderBar";
import Sidebar from "../components/navigation/Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-[#f6f1e8]">
          <HeaderBar />
          <main className="min-h-[calc(100vh-5rem)] overflow-hidden px-6 py-6 sm:px-8">
            <div className="mb-6 flex flex-wrap gap-3 border-b border-[#dacdb8] pb-5 text-sm text-[#7e6b58]">
              <NavLink
                className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 hover:bg-[#f3ecde]"
                to="/"
              >
                Ver landing
              </NavLink>
              <NavLink
                className="rounded-full border border-[#ddcfba] bg-[#fcf8f2] px-4 py-2 hover:bg-[#f3ecde]"
                to="/login"
              >
                Ver login placeholder
              </NavLink>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
