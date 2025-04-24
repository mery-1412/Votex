import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenWidth < 768) {
      setIsCollapsed(true);
      setIsMobileOpen(false);
    }
  }, [screenWidth, setIsCollapsed]);

  const menuItems = [
    { label: "Candidates", icon: <Users size={20} />, href: "/admin/Candidates" },
    { label: "Dashboard", icon: <LayoutDashboard size={28} />, href: "/dashboard" },
    { label: "Sessions", icon: <Settings size={28} />, href: "/sessions" },
    { label: "Archives", icon: <Settings size={28} />, href: "/archives" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div
      className={`h-full flex flex-col bg-gradient-to-b from-[#3A2663] to-[#4C1D95] shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-16 items-center justify-center" : "w-72"
      }`}
    >
      {!isCollapsed && (
        <div className="flex items-center justify-center p-6">
          <Link href="/">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="transition-all duration-300 w-20 h-20"
            />
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        <nav>
          {menuItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-3 cursor-pointer transition-all duration-200 ${
                router.pathname === item.href ? "bg-purple-800" : ""
              }`}
              onClick={() => router.push(item.href)}
            >
              <div className="text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-200">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-200">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div
        onClick={handleLogout}
        className={`p-6 cursor-pointer ${
          isCollapsed ? "flex justify-center" : "flex items-center justify-center gap-4"
        }`}
      >
        {!isCollapsed && (
          <button className="gradient-border-button">LOG OUT</button>
        )}
      </div>

      <div className={`p-6 ${isCollapsed ? "flex justify-center" : "flex justify-end"}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:text-gray-200"
        >
          {isCollapsed ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {screenWidth < 768 && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-white bg-purple-800 p-2 rounded-md"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {screenWidth >= 768 ? (
        <SidebarContent />
      ) : (
        <div
          className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent />
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
