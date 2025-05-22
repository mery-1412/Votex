import { Card } from "@/components/Card/Card"; 
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import React, { useState, useContext, useEffect } from "react";
import { AddProductDialog } from "@/components/AddProductDialog"; 
import { VotingContext } from "../../context/Voter"; 
import { useRouter } from "next/router";

const Candidates = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getCurrentSessionCandidates, getCandidateDetails } = useContext(VotingContext);  
    const router = useRouter();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log("Starting candidate fetch...");
                
                // Step 1: Get candidate addresses
                const candidateAddresses = await getCurrentSessionCandidates();
                console.log("Raw candidate addresses:", candidateAddresses);
                
                if (!candidateAddresses || candidateAddresses.length === 0) {
                    console.log("No candidates found or empty array returned");
                    setCandidates([]);
                    setLoading(false);
                    return;
                }
                
                // Step 2: Fetch details for each candidate
                const candidatesWithDetails = [];
                
                for (let i = 0; i < candidateAddresses.length; i++) {
                    const address = candidateAddresses[i];
                    console.log(`Fetching details for candidate ${i+1}/${candidateAddresses.length}:`, address);
                    
                    const candidateDetails = await getCandidateDetails(address);
                    console.log(`Candidate ${i+1} details:`, candidateDetails);
                    
                    // Only add non-archived candidates
                    if (candidateDetails && !candidateDetails.isArchived) {
                        candidatesWithDetails.push({
                            id: candidateDetails.candidateId,
                            name: candidateDetails.name || "Unnamed Candidate",
                            desc: candidateDetails.party || "No Party",
                            imageUrl: candidateDetails.imageUrl,
                            address: address,
                            age: candidateDetails.age || "N/A",
                            voteCount: candidateDetails.voteCount || "0"
                        });
                    } else {
                        console.log(`Skipping candidate ${address} - archived or no details`);
                    }
                }
                
                console.log("Final processed candidates:", candidatesWithDetails);
                setCandidates(candidatesWithDetails);
                
            } catch (error) {
                console.error("Error fetching candidates:", error);
                setError(error.message || "Failed to load candidates");
            } finally {
                setLoading(false);
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

    if (loading) {
        return (
            <div className="dashboard-page h-screen">
                <div className="flex h-full">
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                            <p className="text-lg text-gray-700">Loading candidates...</p>
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
                            <h3 className="text-xl font-semibold text-red-600 mb-4">Error Loading Candidates</h3>
                            <p className="text-gray-700 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
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
        <div className="dashboard-page">
            <div className="flex h-screen">
                <div className={`transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} bg-white shadow-lg h-full overflow-hidden`}>
                    <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                </div>

                <div className="flex-1 p-6 overflow-auto transition-all duration-300 ml-20">
                    <div className="flex justify-between items-center mb-10 mt-10">
                        <h1 className="text-4xl font-semibold text-gray-900">Candidates</h1>
                    </div>
                    <div className="mb-10 ml-2">
                        <AddProductDialog />
                    </div>
            
                    {candidates.length === 0 && !loading && (
                        <div className="text-center p-10">
                            <h3 className="text-xl font-medium text-gray-600">No candidates found</h3>
                            <p className="mt-2 text-gray-500">Create a candidate or check if a voting session is active.</p>
                        </div>
                    )}
                    
                    <div
                        className={`grid gap-6 transition-all duration-300 ${
                            isCollapsed ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                        }`}
                    >
                        {candidates.map((candidate, index) => (
                            <Card
                                key={`${candidate.id}-${index}`}
                                name={candidate.name}
                                desc={candidate.desc}
                                imageAdd={candidate.imageUrl}
                                age={candidate.age}
                                voteCount={candidate.voteCount}
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