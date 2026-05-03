import { Outlet } from "react-router-dom";
import Sidebar from "../ui/components/sidebar"; 
import Header from "../ui/components/header";     

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 p-4 sm:p-5 lg:p-8 overflow-y-auto overflow-x-hidden pb-28 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}