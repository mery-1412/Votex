import { Card } from "@/components/Card/Card"; 
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import React, { useState, useContext, useEffect} from "react";
import { AddProductDialog } from "@/components/AddProductDialog"; 
import { VotingContext } from "../../context/Voter"; 
import { useRouter } from "next/router";

const Candidates = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAllCandidates } = useContext(VotingContext);  
    const router = useRouter();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllCandidates();
                if (data) {
                    const formattedCandidates = data.map(candidate => ({
                        id: candidate.candidateId,
                        name: candidate.name,
                        desc: candidate.party, 
                        imageUrl: `https://gateway.pinata.cloud/ipfs/${candidate.ipfs}`, 
                        address: candidate._address
                    }));
                    setCandidates(formattedCandidates);
                }
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