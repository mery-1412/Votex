import { useEffect, useState, useContext } from "react";
import { Card } from "@/components/Card/Card"; 
import { useRouter } from "next/router";
import { VotingContext } from "../context/Voter"; 
import UserNavBar from "../components/NavBar/UserNavBar"
import RequireAuth from "./protectingRoutes/RequireAuth";

const CandidatesUser = () => {
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
      pathname: `/CandDetUser`,
      query: { address: candidate.address }, 
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="">
          <UserNavBar/>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-white">Loading candidates...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="">
          <UserNavBar/>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Error Loading Candidates</h3>
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
      </RequireAuth>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <RequireAuth>
        <div className="">
          <UserNavBar/>
          <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-semibold bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
                Voting Hasn't Started Yet!
              </h2>
              <p className="text-gray-400 text-xl max-w-md mx-auto">
                Check back soon to see the candidates and cast your vote.
              </p>
              <button
                onClick={handleRetry}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full 
                  hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="">
        <UserNavBar/>
        <div className="flex h-screen">
          <div className="flex-1 p-6 overflow-auto transition-all duration-300 ml-20 mt-28">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
    </RequireAuth>
  );
};

export default CandidatesUser;