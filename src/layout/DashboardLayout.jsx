import DashboardSide from "@/ui/components/DashboardSide";
import Header from "@/ui/components/Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-y-hidden">
      <Header className="w-full z-20" />

      <div className="flex flex-1">
        <DashboardSide />
        <main className="flex-1 overflow-y-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
