import React, { useState, useEffect, useContext } from "react";
import RequireAdmin from "../protectingRoutes/RequireAdmin";
import AdminSidebar from "@/components/NavBar/AdminNavBar";

const Archives = () => {
  
    const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <RequireAdmin>
      <div className="archives-page flex h-screen">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
    </RequireAdmin>
  );
};

export default Archives;
