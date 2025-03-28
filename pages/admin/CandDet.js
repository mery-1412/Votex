import AdminSidebar from "@/components/NavBar/AdminNavBar";
import React, { useState, useContext, useEffect } from "react";
import { VotingContext } from "../../context/Voter";
import { useRouter } from "next/router";

const CandDet = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getCandidateDetails } = useContext(VotingContext);
  const [candidate, setCandidate] = useState(null);
  const router = useRouter();
  const { address } = router.query;

  useEffect(() => {
    if (address) {
      fetchCandidateData();
    }
  }, [address]);

  const fetchCandidateData = async () => {
    try {
      const data = await getCandidateDetails(address);
      console.log("Candidate Details:", data);

      if (data) {
        setCandidate({
          name: data.name,
          age: data.age,
          party: data.party,
          image: data.imageUrl || "/assets/cand.png",
          description: data.description || "No description available.",
          certificates: data.certificates || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch candidate details", error);
    }
  };

  if (!candidate) {
    return <div className="text-white text-center">Loading candidate details...</div>;
  }

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
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="w-full lg:w-2/3">
                <h1 className="text-4xl font-semibold mb-8">{candidate.name}</h1>
                <h2 className="text-2xl font-semibold mb-4">Party: {candidate.party}</h2>
                <h2 className="text-2xl font-semibold mb-4">Age: {candidate.age}</h2>
                
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 text-lg">{candidate.description}</p>

              
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
};

export default CandDet;
