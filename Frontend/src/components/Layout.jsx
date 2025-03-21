import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); 
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Only visible on desktop */}
      {!isMobile && <Sidebar />}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-20' : 'py-4'} px-4`}>
        {/* Mobile Sidebar - Only visible on mobile */}
        {isMobile && <Sidebar />}
        
        {/* Page Content */}
        <Outlet className="h-screen" /> 
      </main>
    </div>
  );
};

export default Layout;