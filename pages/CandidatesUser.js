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
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Get hasVoted from context
  const { hasVoted, getCurrentSessionCandidates, getCandidateDetails, whiteVote, connectSmartContract, currentAccount } = useContext(VotingContext);

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

      if (!currentAccount) {
        setError("Please connect your wallet first");
        setShowErrorPopup(true);
        return;
      }

      const result = await whiteVote();
      
      // Check if result is an error object
      if (!result.success) {
        setError(result.error);
        setShowErrorPopup(true);
        return;
      }
      
      // If we get here, voting was successful
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error submitting white vote:", error);
      setError(error.message || "Failed to submit white vote");
      setShowErrorPopup(true);
    } finally {
      setIsVoting(false);
    }
  };

  const closeSuccessPopup = () => setShowSuccessPopup(false);
  const closeErrorPopup = () => setShowErrorPopup(false);

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

        {/* ❌ Error Popup */}
        {error && showErrorPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
              <h1 className="text-2xl mb-6 text-red-400">Error</h1>
              <p className="mb-6">{error}</p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                {error.includes("wallet") && (
                  <button
                    onClick={() => {
                      setShowErrorPopup(false);
                      router.push('/account'); 
                    }}
                    className="w-full py-3 bg-[#B342FF] hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Manage Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🔘 Voting buttons */}
        <div className="fixed top-24 left-0 right-0 p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-end space-x-4">
            {/* White vote button */}
            <button
              onClick={handleWhiteVote}
              disabled={hasVoted || isVoting}
              className={`px-6 py-2 ${
                hasVoted
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-[#B342FF] hover:bg-purple-700'
              } text-white rounded-lg transition-all duration-300`}
            >
              {isVoting ? 'Processing...' : (hasVoted ? 'Already Voted' : 'White Vote')}
            </button>

            {/* Multiple vote button */}
            <button
              onClick={() => router.push('/multiple-vote')}
              disabled={hasVoted}
              className={`px-6 py-2 ${
                hasVoted
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-[#B342FF] hover:bg-purple-700'
              } text-white rounded-lg transition-all duration-300`}
            >
              {hasVoted ? 'Already Voted' : 'Multiple Vote'}
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



