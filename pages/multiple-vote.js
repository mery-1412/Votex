import { useState, useContext, useEffect } from "react";
import { Card } from "@/components/Card/Card";
import { VotingContext } from "../context/Voter";
import UserNavBar from "../components/NavBar/UserNavBar";
import RequireAuth from "./protectingRoutes/RequireAuth";
import Popup from "@/components/Popup";
import { useRouter } from "next/router";

const MultipleVote = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [votedCandidates, setVotedCandidates] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false); // Add this
  const { 
    getCurrentSessionCandidates, 
    getCandidateDetails, 
    multipleVote,
    connectSmartContract,
    currentAccount,
    hasVoted
  } = useContext(VotingContext);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (hasVoted) {
      router.push('/home-user');
    }
  }, [hasVoted, router]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const contract = await connectSmartContract();
        if (!contract) {
          throw new Error("Smart contract connection failed. Please make sure your wallet is connected.");
        }
        
        const candidateAddresses = await getCurrentSessionCandidates();
        console.log("Candidate addresses:", candidateAddresses);
        
        if (!candidateAddresses || candidateAddresses.length === 0) {
          throw new Error("No candidates found for current session");
        }
        
        const candidatesData = await Promise.all(
          candidateAddresses.map(async (address) => {
            try {
              const details = await getCandidateDetails(address);
              return {
                ...details,
                address: address
              };
            } catch (err) {
              console.error(`Error fetching details for candidate ${address}:`, err);
              return null;
            }
          })
        );
        
        const validCandidates = candidatesData.filter(c => c !== null);
        console.log("Fetched candidates:", validCandidates);
        
        setCandidates(validCandidates);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to load candidates: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentAccount) {
      fetchCandidates();
    }
  }, [getCurrentSessionCandidates, getCandidateDetails, connectSmartContract, currentAccount]);

  const handleVoteClick = (candidate) => {
    if (votedCandidates.includes(candidate.address)) {
      return;
    }
   
    setSelectedCandidates(prev => {
      const isAlreadySelected = prev.find(c => c.address === candidate.address);
      if (isAlreadySelected) {
        return prev.filter(c => c.address !== candidate.address);
      }
      return [...prev, candidate];
    });
  };

  const handleConfirmVote = async () => {
    try {
      setError(null);
      setIsVoting(true);
      
      if (!currentAccount) {
        setError("Wallet not connected. Please connect your wallet.");
        setShowConfirmation(false);
        return;
      }
      
      if (selectedCandidates.length < 2) {
        setError("Please select at least 2 candidates");
        setShowConfirmation(false);
        return;
      }
      
      const selectedAddresses = selectedCandidates.map(c => c.address);
      console.log("Submitting vote for candidates:", selectedAddresses);
      
      const result = await multipleVote(selectedAddresses);
      
      if (!result.success) {
        setError(result.error);
        setShowConfirmation(false);
        setShowErrorPopup(true);
        return;
      }
      
      setVotedCandidates(prev => [...prev, ...selectedCandidates.map(c => c.address)]);
      setSelectedCandidates([]);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Voting error:", error);
      setError(error.message || "Failed to submit votes");
    } finally {
      setIsVoting(false);
      setShowConfirmation(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    router.push("/user-dashboard");
  };

  const CandidateCard = ({ candidate, isSelected, selectionIndex, onClick }) => {
    const isVoted = votedCandidates.includes(candidate.address);
    
    return (
      <div 
        className={`bg-[#212121] rounded-xl shadow-lg overflow-hidden transition-all duration-300
          ${isVoted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
          ${isSelected ? 'ring-2 ring-purple-500 transform scale-105' : ''}
        `}
        onClick={isVoted ? null : onClick}
      >
        <div className="relative">
          <img 
            src={candidate.imageUrl || "/assets/default-candidate.png"} 
            alt={candidate.name}
            className="w-full h-52 object-cover"
          />
          
          {isSelected && (
            <div className="absolute top-2 right-2 bg-[#B342FF] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
              <span className="font-bold">{selectionIndex + 1}</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16">
            {isSelected && (
              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs py-1 px-2 rounded-full">
                Selected
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-white">{candidate.name || "Unknown"}</h3>
          <p className="text-gray-400">{candidate.party || "No party"}</p>
        </div>
        
        <div className="px-4 pb-4">
          {isSelected ? (
            <button 
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleVoteClick(candidate);
              }}
            >
              Remove
            </button>
          ) : (
            <button 
              className={`w-full py-2 bg-[#B342FF] hover:bg-purple-700 text-white rounded-lg transition duration-300
                ${isVoted ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isVoted}
            >
              {isVoted ? 'Already Voted' : 'Select Candidate'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d1b69] text-white">
        <UserNavBar />
       
        <div className="container mx-auto px-4 py-8 pb-24">
 
          
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-lg">Loading candidates...</p>
            </div>
          ) : error && !candidates.length ? (
            <div className="text-center py-16">
              <div className="text-red-400 text-5xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Error Loading Candidates</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
              >
                Retry
              </button>
            </div>
          ) : candidates.length > 0 ? (

            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-52">

              {candidates.map((candidate, index) => {
                const selectedIndex = selectedCandidates.findIndex(c => c.address === candidate.address);
                const isSelected = selectedIndex !== -1;
                
                return (
                  <CandidateCard
                    key={candidate.address}
                    candidate={candidate}
                    isSelected={isSelected}
                    selectionIndex={selectedIndex}
                    onClick={() => handleVoteClick(candidate)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-yellow-400 text-5xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">No Candidates Available</h3>
              <p className="text-gray-300">There are no candidates in the current voting session.</p>
            </div>
          )}
        </div>

        {candidates.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1e1e1e] bg-opacity-95 shadow-lg backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold text-white">
                    Selected: <span className="text-purple-400">{selectedCandidates.length}</span> candidates
                  </h2>
                  {selectedCandidates.length === 1 && (
                    <p className="text-yellow-400 text-sm">Select at least one more candidate</p>
                  )}
                </div>
                <button
                  onClick={() => selectedCandidates.length >= 2 && setShowConfirmation(true)}
                  disabled={selectedCandidates.length < 2 || isVoting || isLoading || hasVoted}
                  className={`px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 w-full sm:w-auto
                    ${selectedCandidates.length < 2 || isVoting || isLoading || hasVoted
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#B342FF] hover:bg-purple-700 shadow-lg hover:shadow-purple-500/20'
                    }`}
                >
                  {isVoting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (hasVoted ? 'Already Voted' : 'Submit Votes')}
                </button>
              </div>
            </div>
          </div>
        )}

        <Popup
          isOpen={showConfirmation}
          message={`Are you sure you want to distribute your vote among these ${selectedCandidates.length} candidates?`}
          action="Confirm Vote"
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmVote}
        />
        
        <Popup
          isOpen={showSuccessPopup}
          message="Your votes have been successfully recorded!"
          action="Back to Dashboard"
          onClose={handleSuccessClose}
          onConfirm={handleSuccessClose}
        />

    

        {error && candidates.length > 0 && (
          <div className="fixed bottom-24 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-xs z-50 animate-fade-in-right">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
};

export default MultipleVote;



