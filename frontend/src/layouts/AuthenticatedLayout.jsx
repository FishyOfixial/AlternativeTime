import { NavLink, Outlet } from "react-router-dom";
import HeaderBar from "../components/navigation/HeaderBar";
import Sidebar from "../components/navigation/Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <HeaderBar />
          <main className="panel-surface min-h-[calc(100vh-5rem)] overflow-hidden p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap gap-3 border-b border-white/10 pb-5 text-sm text-slate-300">
              <NavLink className="rounded-full bg-white/5 px-4 py-2 hover:bg-white/10" to="/">
                Ver landing
              </NavLink>
              <NavLink className="rounded-full bg-white/5 px-4 py-2 hover:bg-white/10" to="/login">
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
