import { Card } from "@/components/Card/Card"; 
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import React, { useState } from "react";
import { AddProductDialog } from "@/components/AddProductDialog"; 
 


const Candidates = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const candidatesData = [
      {
        id: 1,
        name: "John Doe",
        desc: "Software Engineer",
        imageAdd: "",
      },
      {
        id: 2,
        name: "Jane Smith",
        desc: "Product Manager",
        imageAdd: "",
      },
      {
        id: 3,
        name: "Alice Johnson",
        desc: "UI/UX Designer",
        imageAdd: "",
      },
      {
        id: 4,
        name: "Alice Johnson",
        desc: "UI/UX Designer",
        imageAdd: "",
      },{
        id: 5,
        name: "Alice Johnson",
        desc: "UI/UX Designer",
        imageAdd: "",
      },{
        id: 6,
        name: "Alice Johnson",
        desc: "UI/UX Designer",
        imageAdd: "",
      },
    ];
  
  return (
    <div className="dashboard-page">
      <div className="flex h-screen">

      
        
      <div className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} bg-white shadow-lg h-full overflow-hidden`}>
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      

      <div className="flex-1 p-6 overflow-auto transition-all duration-300 ml-20 ">
      <div className="flex justify-between items-center mb-10 mt-10 ">
        <h1 className="text-4xl font-semibold text-gray-900 ">Candidates</h1>
      </div>
      <div className="mb-10 ml-2 ">
        <AddProductDialog />
      </div>
  
          <div
        className={`grid gap-6 transition-all duration-300 ${
          isCollapsed ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4": "grid-cols-1  lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
        }`}
      >
            {candidatesData.map((candidate) => (
              <Card
                key={candidate.id}
                name={candidate.name}
                desc={candidate.desc}
                imageUrl={candidate.imageUrl}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Candidates;
