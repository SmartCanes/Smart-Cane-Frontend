import { Outlet } from "react-router-dom";
import Sidebar from "../ui/components/sidebar";   // note lowercase 's'
import Header from "../ui/components/header";     // note lowercase 'h'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}