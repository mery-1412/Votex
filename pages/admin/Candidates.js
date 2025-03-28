import { Card } from "@/components/Card/Card"; 
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import React, { useState, useContext, useEffect} from "react";
import { AddProductDialog } from "@/components/AddProductDialog"; 
import { VotingContext } from "../../context/Voter"; 
import { useRouter } from "next/router";




const Candidates = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

   const [candidates, setCandidates] = useState([]);
   const { getAllCandidates } = useContext(VotingContext);  
   const router = useRouter();

     useEffect(() => {
       const fetchCandidates = async () => {
         try {
           const data = await getAllCandidates();
           if (data) {
   
             const formattedCandidates = data.map(candidate => ({
               id: candidate.candidateId,
               name: candidate.name,
               desc: candidate.party, 
               imageUrl: `https://gateway.pinata.cloud/ipfs/${candidate.ipfs}`, 
               address:candidate._address
             }));
             setCandidates(formattedCandidates);
             console.log('data',formattedCandidates)
           }
         } catch (error) {
           console.error("Error fetching candidates:", error);
         }
       };
       fetchCandidates();
     }, []);
   
     const handleSeeMore = (candidate) => {
       router.push({
         pathname: `/admin/CandDet`,
         query: { address: candidate.address }, 
       });
     };
  
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
             {candidates.map((candidate, index) => (
                          <Card
                          key={`${candidate.id}-${index}`} 
                          name={candidate.name}
                          desc={candidate.desc}
                          imageAdd={candidate.imageUrl}
                          onClick={() => handleSeeMore(candidate)}
                          
                          />
                        ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Candidates;
