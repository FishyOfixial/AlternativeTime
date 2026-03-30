import { useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderBar from "../components/navigation/HeaderBar";
import MobileSidebarDrawer from "../components/navigation/MobileSidebarDrawer";
import Sidebar from "../components/navigation/Sidebar";

export default function AuthenticatedLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="page-shell">
      <div className="flex min-h-[100dvh] w-full gap-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-[#f6f1e8]">
          <HeaderBar onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className="h-[calc(100dvh-4.6rem)] overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <MobileSidebarDrawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </div>
  );
}
