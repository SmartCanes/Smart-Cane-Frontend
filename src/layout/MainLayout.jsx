import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../ui/components/sidebar"; 
import Header from "../ui/components/header";     

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-5 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}