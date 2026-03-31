import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderBar from "../components/navigation/HeaderBar";
import MobileSidebarDrawer from "../components/navigation/MobileSidebarDrawer";
import PwaStatusBanner from "../components/pwa/PwaStatusBanner";
import Sidebar from "../components/navigation/Sidebar";

export default function AuthenticatedLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="page-shell">
      <div className="flex min-h-[100dvh] w-full gap-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-[#f6f1e8]">
          <HeaderBar onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <div className="border-b border-[#e6dac4] bg-[#f8f4ec] px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <PwaStatusBanner />
            </div>
          </div>
          <main className="h-[calc(100dvh-4.6rem)] overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]" key={location.pathname}>
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
