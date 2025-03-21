import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, List, Settings, ShoppingBag, PlusCircle, LogOut, Moon, Sun, Store } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../app/features/auth/authActions";
import { setAuthUser } from "../app/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Default to open - we'll update based on screen size
  const [logoutClicked, setLogoutClicked] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Set sidebar state based on device type
      setIsOpen(!mobile); // Open for desktop, closed for mobile
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle outside click to close mobile sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen]);

  // Prevent scrollbar flash on desktop
  useEffect(() => {
    if (!isMobile) {
      // Fix to prevent scrollbar flash specifically at the bottom of sidebar
      document.documentElement.style.overflow = "hidden";
      
      // Release overflow after a small delay
      setTimeout(() => {
        document.documentElement.style.overflow = "";
      }, 350);
    }
  }, [isOpen, isMobile]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(setAuthUser(null));
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
      setError(err.message || "Logout failed. Please try again.");
    }
  };

  // Mobile navbar content
  const mobileNavbar = (
    <div className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-700 z-20">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <button onClick={() => setIsOpen(!isOpen)} className=" rounded-lg transition-colors text-white">
          {isOpen ? <X className="w-[24px] h-[24px]" /> : <Menu className="w-[24px] h-[24px]"/>}
        </button>
      </div>
    </div>
  );

  // Mobile sidebar with transition
  const mobileSidebar = (
    <div 
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-700 z-10 shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Links */}
      <div className="flex-1">
        <nav className="flex flex-col p-3 space-y-2">
          <SidebarItem to="/admin-dash" icon={<Home size={20} />} label="Dashboard" isOpen={true} closeSidebar={() => isMobile && setIsOpen(false)} />
          <SidebarItem to="/allProducts" icon={<Store size={20} />} label="Products" isOpen={isOpen} closeSidebar={() => isMobile && setIsOpen(false)} />
          <SidebarItem to="/admin-orders" icon={<ShoppingBag size={20} />} label="Orders" isOpen={true} closeSidebar={() => isMobile && setIsOpen(false)} />
          <SidebarItem to="/create-product" icon={<PlusCircle size={20} />} label="Add Product" isOpen={true} closeSidebar={() => isMobile && setIsOpen(false)} />
          <SidebarItem to="/categories" icon={<List size={20} />} label="Categories" isOpen={true} closeSidebar={() => isMobile && setIsOpen(false)} />
        </nav>
      </div>

      {/* Sidebar Footer with Logout */}
      <div className="p-4 text-sm text-gray-400 border-t border-gray-700 bg-gray-900">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setLogoutClicked(true)} 
            className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop sidebar with fixes to prevent scrollbar flash
  const desktopSidebar = (
    <div className={`h-screen ${isOpen ? "w-64" : "w-20"} border-r border-gray-700 transition-all duration-300 flex-shrink-0 bg-gray-900 flex flex-col shadow-lg relative`}>
      {/* Sidebar Header - Fixed */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700 bg-gray-900">
        <h1 className={`text-xl mx-auto font-bold text-white transition-all duration-300 ${!isOpen && "hidden"}`}>Admin Panel</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-gray-700 mx-auto transition-colors text-white">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="flex flex-col p-3 space-y-2">
          <SidebarItem to="/admin-dash" icon={<Home size={20} />} label="Dashboard" isOpen={isOpen} />
          <SidebarItem to="/allProducts" icon={<Store size={20} />} label="Products" isOpen={isOpen} />
          <SidebarItem to="/admin-orders" icon={<ShoppingBag size={20} />} label="Orders" isOpen={isOpen} />
          <SidebarItem to="/create-product" icon={<PlusCircle size={20} />} label="Add Product" isOpen={isOpen} />
          <SidebarItem to="/categories" icon={<List size={20} />} label="Categories" isOpen={isOpen} />
        </nav>
      </div>

      {/* Sidebar Footer with Logout */}
      <div className="p-4 text-sm text-gray-400 border-t border-gray-700 bg-gray-900 overflow-x-hidden">
        <div className="flex justify-between items-center">
          <button onClick={() => setLogoutClicked(true)} className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-700">
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          {mobileNavbar}
          {mobileSidebar}
        </>
      ) : (
        desktopSidebar
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Logout Confirmation Popup */}
{logoutClicked && (
  <div 
    className="fixed inset-0 flex items-center justify-center z-[1000] transition-opacity duration-300 ease-in-out"
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      animation: 'fadeIn 0.3s ease-in-out'
    }}
  >
    <div
      className="bg-gray-800 p-6 rounded-lg shadow-xl text-center relative w-[350px] border border-purple-500"
      style={{ 
        animation: 'scaleIn 0.3s ease-in-out',
        willChange: 'opacity, transform'
      }}
    >
      <p className="text-lg font-semibold mb-5 text-white">Are you sure you want to logout?</p>
      <div className="flex justify-center gap-4">
        <button onClick={handleLogout} className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition">Yes, Logout</button>
        <button onClick={() => setLogoutClicked(false)} className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition">Cancel</button>
      </div>
    </div>
  </div>
)}

{/* Error Popup - Replace with this updated version */}
{error && (
  <div
    className="fixed inset-0 flex items-center justify-center z-[1000] transition-opacity duration-300 ease-in-out"
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      animation: 'fadeIn 0.3s ease-in-out'
    }}
  >
    <div
      className="bg-gray-800 p-6 rounded-lg shadow-xl text-center relative w-[350px] border border-purple-500"
      style={{ 
        animation: 'scaleIn 0.3s ease-in-out',
        willChange: 'opacity, transform'
      }}
    >
      <button
        onClick={() => setError(null)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      <p className="text-lg font-semibold mb-4 text-purple-400">{error}</p>
      <button
        onClick={() => setError(null)}
        className="bg-gray-600 text-white px-5 py-2 rounded-md hover:bg-gray-700 transition"
      >
        Close
      </button>
    </div>
  </div>
)}
    </>
  );
};

const SidebarItem = ({ to, icon, label, isOpen, closeSidebar }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`flex items-center space-x-3 p-3 rounded-lg text-white transition-all 
        ${isActive ? "bg-gray-700" : "hover:bg-gray-700"} ${isOpen ? "justify-start" : "justify-center"}`}
    >
      <div className="text-gray-300">{icon}</div>
      {isOpen && <span className="font-medium">{label}</span>}
    </Link>
  );
};

export default Sidebar;