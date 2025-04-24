import React, { useState, useEffect } from "react";
import RequireAdmin from "../protectingRoutes/RequireAdmin";
import AdminSidebar from "@/components/NavBar/AdminNavBar";
import Countdown from "@/components/Card/Countdown";


const Sessions = () => {
   const [isCollapsed, setIsCollapsed] = useState(false);
 
  return (
    <RequireAdmin>
      <div className="sessions-page flex h-screen">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="w-full">
      <Countdown/>
      </div>
      
      </div>
    </RequireAdmin>
  );
};

export default Sessions;
