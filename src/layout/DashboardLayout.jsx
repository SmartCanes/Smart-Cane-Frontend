import DashboardSide from "@/ui/components/DashboardSide";
import Header from "@/ui/components/Header";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef, createContext } from "react";

export const ScrollContext = createContext();

const DashboardLayout = () => {
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = (currentScrollY) => {
    // Only apply on mobile
    if (window.innerWidth >= 768) {
      setShowNav(true);
      return;
    }

    // Ignore negative scroll (bounce)
    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      // Scrolling down
      setShowNav(false);
    } else if (currentScrollY < lastScrollY.current) {
      // Scrolling up
      setShowNav(true);
    }
    
    lastScrollY.current = currentScrollY;
  };

  return (
    <ScrollContext.Provider value={{ handleScroll }}>
      <div className="min-h-screen flex flex-col overflow-y-hidden bg-primary-100">
        <div className={`transition-all duration-300 ease-in-out z-20 w-full md:mt-0 ${showNav ? 'mt-0' : '-mt-[var(--header-height)]'}`}>
          <Header />
        </div>

        <div className="flex flex-1">
          <DashboardSide showNav={showNav} />
          <main className="flex-1 overflow-y-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </ScrollContext.Provider>
  );
};

export default DashboardLayout;
