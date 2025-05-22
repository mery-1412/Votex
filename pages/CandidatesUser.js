import { useEffect, useState, useContext } from "react";
import { Card } from "@/components/Card/Card";
import { useRouter } from "next/router";
import { VotingContext } from "../context/Voter";
import UserNavBar from "../components/NavBar/UserNavBar";
import RequireAuth from "./protectingRoutes/RequireAuth";
import axios from "axios";
import { ethers } from "ethers";


const CandidatesUser = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);


  const {
    getCurrentSessionCandidates,
    getCandidateDetails,
    whiteVote,
    connectSmartContract,
    currentAccount
  } = useContext(VotingContext);


  const router = useRouter();


  // Fetch all candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const addresses = await getCurrentSessionCandidates();


        if (!addresses || addresses.length === 0) {
          setCandidates([]);
          return;
        }


        const details = await Promise.all(
          addresses.map(async (address, index) => {
            try {
              const detail = await getCandidateDetails(address);
              if (!detail?.isArchived) {
                return {
                  id: detail.candidateId || `candidate-${index}`,
                  name: detail.name || "Unnamed Candidate",
                  desc: detail.party || "No Party",
                  imageUrl: detail.imageUrl || "/default-candidate.png",
                  address,
                  age: detail.age || "N/A",
                  voteCount: detail.voteCount || "0",
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching candidate ${index + 1}:`, err);
              return null;
            }
          })
        );


        setCandidates(details.filter(Boolean));
      } catch (err) {
        setError(err.message || "Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };


    fetchCandidates();
  }, [getCurrentSessionCandidates, getCandidateDetails]);


  const handleSeeMore = (candidate) => {
    router.push({
      pathname: `/CandDetUser`,
      query: { address: candidate.address },
    });
  };


  const handleRetry = () => {
    window.location.reload();
  };


  // White vote logic
  const handleWhiteVote = async () => {
    try {
      setIsVoting(true);
      setError(null);
      
      // Use the whiteVote function from VotingContext which now has wallet verification
      await whiteVote();
      
      // Show success popup
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("White vote error:", err);
      setError(err.message);
    } finally {
      setIsVoting(false);
    }
  };


  const closeSuccessPopup = () => setShowSuccessPopup(false);


  if (loading) {
    return (
      <RequireAuth>
        <UserNavBar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-white">Loading candidates...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }


  if (error && !isVoting) {
    return (
      <RequireAuth>
        <UserNavBar />
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
      </RequireAuth>
    );
  }


  return (
    <RequireAuth>
      <UserNavBar />
      <div className="flex flex-col h-screen">


        {/* ✅ Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mt-3">Vote Successful!</h3>
                <p className="text-gray-600 mt-2">Your white vote has been recorded successfully.</p>
                <div className="mt-6">
                  <button
                    onClick={closeSuccessPopup}
                    className="px-4 py-2 bg-[#B342FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ❌ Error Popup (wallet conflict) */}
        {error && isVoting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mt-3">Wallet Conflict</h3>
                <p className="text-gray-600 mt-2">{error}</p>
                <div className="mt-6 space-x-4">
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => router.push('/account')}
                    className="px-4 py-2 bg-[#B342FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Change Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 🔘 Voting buttons */}
        <div className="fixed top-24 left-0 right-0 p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-end space-x-4">
            <button
              onClick={handleWhiteVote}
              disabled={isVoting}
              className={`px-6 py-2 rounded-lg text-white transition-all duration-300
                ${isVoting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#B342FF] hover:bg-purple-700'}`}
            >
              {isVoting ? 'Submitting...' : 'White Vote'}
            </button>
            <button
              onClick={() => alert("Multiple voting feature coming soon!")}
              className="px-6 py-2 bg-[#B342FF] text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
            >
              Multiple Vote
            </button>
          </div>
        </div>


        {/* 🧾 Candidate cards */}
        <div className="flex-1 p-6 overflow-auto ml-20 mt-36">
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
    </RequireAuth>
  );
};


export default CandidatesUser;



