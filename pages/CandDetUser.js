import React, { useState, useEffect, useContext } from "react";
import UserNavBar from "../components/NavBar/UserNavBar";
import { VotingContext } from "../context/Voter"; 
import { AuthContext } from "./context/AuthContext";
import { useRouter } from "next/router";
import RequireAuth from "./protectingRoutes/RequireAuth";

const CandDetUser = () => { 
  const { 
    getCandidateDetails, 
    vote, 
    hasVoted, 
    setHasVoted,
    checkIfUserVoted, 
    currentAccount,
    checkVotingPeriod
  } = useContext(VotingContext);
  const { user  } = useContext(AuthContext);
  
  const [candidate, setCandidate] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); 
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { address } = router.query;

  // Check voting status whenever component mounts or account/user changes
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (currentAccount && user?.id) {
        const hasAlreadyVoted = await checkIfUserVoted();
        setHasVoted(hasAlreadyVoted);
      }
    };

    checkVotingStatus();
  }, [currentAccount, user, checkIfUserVoted]);

  useEffect(() => {
    if (address) {
      fetchCandidateData();
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
        name: data.name,
        age: data.age,
        party: data.party,
        image: data.imageUrl,
        address: data.address,
      });
    } catch (error) {
      console.error("Failed to fetch candidate details", error);
      setError(error.message || "Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!user || !user.id) {
        setError("You must be logged in to vote");
        setShowErrorPopup(true);
        return;
      }

      // Check if wallet is connected
      if (!currentAccount) {
        setError("Please connect your wallet");
        setShowErrorPopup(true);
        return;
      }

      // Let the vote function handle all checks
      const result = await vote(candidate.address);
      
      // Check if result is an error object
      if (result && typeof result === 'object' && result.hasOwnProperty('success') && !result.success) {
        setError(result.error);
        setShowErrorPopup(true);
        return;
      }
      
      // If we get here, voting was successful
      setHasVoted(true);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Voting failed:", error);
      setError(error.message || "An error occurred while voting");
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchCandidateData();
  };

  if (loading && !candidate) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-screen relative">
          <UserNavBar />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative w-[90%] max-w-6xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading candidate details...</p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-screen relative">
          <UserNavBar />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative w-[90%] max-w-6xl p-12 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Error Loading Candidate</h3>
            <p className="text-gray-200 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="gradient-border-button"
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
      <div className="flex items-center justify-center min-h-screen relative">
        <UserNavBar />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative w-[90%] max-w-6xl p-12 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white mt-10">
          <h1 className="text-4xl font-semibold mb-12">{candidate.name}</h1>

          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-10 m-8">
            <div className="w-full lg:w-1/3">
              <img
                src={candidate.image}  
                alt="Candidate"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            <div className="w-full lg:w-3/5 flex flex-col justify-center m-4">
              <h2 className="text-3xl font-semibold mb-4 text-center lg:text-left">Age</h2>
              <p className="text-gray-200 text-lg text-center lg:text-left">{candidate.age}</p>

              <h2 className="text-3xl font-semibold mb-4 text-center lg:text-left">Party</h2>
              <p className="text-gray-200 text-lg text-center lg:text-left">{candidate.party}</p>

              <div className="mt-8 flex justify-center lg:justify-end">
                <button 
                  className={`gradient-border-button ${hasVoted ? "opacity-50 cursor-not-allowed" : ""}`} 
                  onClick={handleVote}
                  disabled={hasVoted || loading}
                >
                  {loading ? "Processing..." : hasVoted ? "VOTED" : "VOTE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
            <h1 className="text-2xl mb-8">Vote Submitted Successfully!</h1>
            <img src='/assets/check.png' alt="Success" className="w-48 h-36 mx-auto mb-4 object-contain" />
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                router.push('/home-user'); // Redirect after successful vote
              }}
              className="gradient-border-button"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

     
    </RequireAuth>
  );
};

export default CandDetUser;