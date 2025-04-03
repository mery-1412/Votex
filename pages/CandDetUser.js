// export default CandDetUser;
import React, { useState, useEffect, useContext } from "react";
import UserNavBar from "../components/NavBar/UserNavBar";
import { VotingContext } from "../context/Voter"; 
import { useRouter } from "next/router";
import RequireAuth from "./protectingRoutes/RequireAuth";

const CandDetUser = () => { 
  const { getCandidateDetails, vote } = useContext(VotingContext);
  const [candidate, setCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false); // Track if user has voted
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Show success popup
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
          image: data.imageUrl,
          address: data.address,
        });
      }
    } catch (error) {
      console.error("Failed to fetch candidate details", error);
    }
  };

  const handleVote = async () => {
    try {
      await vote(candidate.address);
      setHasVoted(true); // Disable the button after voting
      setShowSuccessPopup(true); // Show success message
    } catch (error) {
      console.error("Voting failed", error);
    }
  };

  if (!candidate) {
    return <div className="text-white text-center">Loading candidate details...</div>;
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
                  disabled={hasVoted}
                >
                  {hasVoted ? "VOTED" : "VOTE"}
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
              onClick={() => setShowSuccessPopup(false)}
              className="gradient-border-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </RequireAuth>
  );
};

export default CandDetUser;
