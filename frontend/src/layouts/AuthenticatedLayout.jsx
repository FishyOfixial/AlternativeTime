import { Outlet } from "react-router-dom";
import HeaderBar from "../components/navigation/HeaderBar";
import Sidebar from "../components/navigation/Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="page-shell">
      <div className="flex min-h-screen w-full gap-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-[#f6f1e8]">
          <HeaderBar />
          <main className="min-h-[calc(100vh-5rem)] overflow-hidden px-6 py-6 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
