import AdminSidebar from "@/components/NavBar/AdminNavBar";
import React, { useState } from "react";

const CandDet = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="dashboard-page">
      <div className="flex h-screen">
        <div className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} bg-white shadow-lg h-full overflow-hidden`}>
          <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        <div className="flex-1 p-10 overflow-auto transition-all duration-300">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="w-full lg:w-1/3">
                <img
                  src="/assets/cand.png"
                  alt="Candidate"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="w-full lg:w-2/3">
                <h1 className="text-4xl font-semibold mb-8">Nichole Smasher</h1>

                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 text-lg">
                  Has been a political candidate since 2023...Has been a political candidate since 2023...
                  Has been a political candidate since 2023...Has been a political candidate since 2023...
                  Has been a political candidate since 2023...
                </p>

                <div className="mt-6">
                  <h2 className="text-2xl font-semibold mb-3">Certificates</h2>
                  <ul className="list-disc list-inside text-lg text-gray-700">
                    <li>bbbbbbbbbb</li>
                    <li>bbbbbbbbbb</li>
                    <li>wwwwwwwwwwwwww</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
};

export default CandDet;
