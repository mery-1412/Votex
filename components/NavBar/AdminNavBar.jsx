import React, { useState, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: "Candidates", icon: <Users size={20} />, href: "/dashboard/users" },
    { label: "Sessions", icon: <Settings size={20} />, href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
      style={{
        background: "linear-gradient(to bottom, #3A2663, #4C1D95)", // Gradient purple-blue background
      }}
    >
      {/* Top Section: Logo */}
      <div className="flex items-center justify-center p-4">
        <Link href="/">
          <img
            src="/assets/logo.png" // Update the path to your logo
            alt="Logo"
            className={`${isCollapsed ? "w-10 h-10" : "w-16 h-16"} transition-all duration-300`}
          />
        </Link>
      </div>

      {/* Middle Section: Navigation Links */}
      <div className="flex-1 flex flex-col justify-center"> {/* Center the navigation links vertically */}
        <nav>
          {menuItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-3 cursor-pointer transition-all duration-200 ${
                router.pathname === item.href ? "bg-white" : ""
              }`}
              onClick={() => router.push(item.href)}
            >
              {/* Gradient Icon and Text on Hover */}
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

      {/* Bottom Section: Logout Button */}
      <div
        onClick={handleLogout}
        className="flex items-center justify-center gap-4 p-4 cursor-pointer transition-colors duration-200"
      >
        {!isCollapsed && (
          <button className="gradient-border-button">
            LOG OUT
          </button>
        )}
      </div>

      {/* Toggle Button */}
      <div className="flex justify-end p-4">
      <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:text-gray-200 transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

      </div>
    </div>
  );
};

export default AdminSidebar;