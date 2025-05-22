import AdminSidebar from "@/components/NavBar/AdminNavBar";
import React, { useState, useContext, useEffect } from "react";
import { VotingContext } from "../../context/Voter";
import { useRouter } from "next/router";
import { ethers } from "ethers";

const CandDet = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getCandidateDetails } = useContext(VotingContext);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { address } = router.query;

  useEffect(() => {
    if (address && ethers.utils.isAddress(address)) {
      fetchCandidateData();
    } else if (address) {
      setError("Invalid candidate address");
      setLoading(false);
    }
  }, [address]);

  const fetchCandidateData = async () => {
    try { 
      setLoading(true);
      setError(null);
      
      const data = await getCandidateDetails(address);
      console.log("Candidate Details:", data);

      if (!data || !data.name) {
        throw new Error("Candidate not found");
      }

      setCandidate({
        name: data.name || "Unknown",
        age: data.age || "Not specified",
        party: data.party || "No party affiliation",
        image: data.imageUrl || "/assets/cand.png",
        description: data.description || "No description available.",
        certificates: data.certificates || [],
      });
    } catch (err) {
      console.error("Failed to fetch candidate details", err);
      setError(err.message || "Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchCandidateData();
  };

  if (loading) {
    return (
      <div className="dashboard-page h-screen">
        <div className="flex h-full">
          <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-lg text-gray-700">Loading candidate details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page h-screen">
        <div className="flex h-full">
          <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Error Loading Candidate</h3>
              <p className="text-gray-700 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page h-screen">
      <div className="flex h-full">
        <div className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} bg-white shadow-lg h-full overflow-hidden`}>
          <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-6xl my-8">
              <div className="flex flex-col lg:flex-row items-start gap-10">
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full max-w-xs h-auto rounded-lg shadow-lg mb-4"
                  />
                  <div className="w-full bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Quick Info</h3>
                    <p><span className="font-medium">Party:</span> {candidate.party}</p>
                    <p><span className="font-medium">Age:</span> {candidate.age}</p>
                  </div>
                </div>

                <div className="w-full lg:w-2/3">
                  <h1 className="text-4xl font-bold mb-6 text-gray-800">{candidate.name}</h1>
                  
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3 text-gray-700 border-b pb-2">About</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">{candidate.description}</p>
                  </div>

                  {candidate.certificates.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-semibold mb-3 text-gray-700 border-b pb-2">Certificates</h2>
                      <ul className="space-y-2">
                        {candidate.certificates.map((cert, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">•</span>
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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