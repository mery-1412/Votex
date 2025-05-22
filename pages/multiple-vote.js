import { useState, useContext } from "react";
import { Card } from "@/components/Card/Card";
import { VotingContext } from "../context/Voter";
import UserNavBar from "../components/NavBar/UserNavBar";
import RequireAuth from "./protectingRoutes/RequireAuth";
import Popup from "@/components/Popup";


const MultipleVote = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [votedCandidates, setVotedCandidates] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const { getAllCandidates, multipleVote } = useContext(VotingContext);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);


  const handleVoteClick = (candidate) => {
    if (votedCandidates.includes(candidate.address)) return;
   
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
      setIsVoting(true);
      await multipleVote(selectedCandidates.map(c => c.address));
      setVotedCandidates(prev => [...prev, ...selectedCandidates.map(c => c.address)]);
      setSelectedCandidates([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsVoting(false);
      setShowConfirmation(false);
    }
  };


  return (
    <RequireAuth>
      <div className="min-h-screen">
        <UserNavBar />
       
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.address}
                className={`transition-opacity duration-300
                  ${votedCandidates.includes(candidate.address) ? 'opacity-50' : 'opacity-100'}`}
              >
                <Card
                  name={candidate.name}
                  desc={candidate.desc}
                  imageAdd={candidate.imageUrl}
                  onClick={() => handleVoteClick(candidate)}
                />
              </div>
            ))}
          </div>
        </div>


        {/* Fixed bottom bar for vote submission */}
        <div className="fixed bottom-0 left-0 right-0 bg-opacity-90  shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Selected Candidates: {selectedCandidates.length}
              </h2>
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={selectedCandidates.length < 2 || isVoting}
                className={`px-8 py-3 rounded-lg text-white transition-all duration-300
                  ${selectedCandidates.length < 2 || isVoting
                    ? 'gradient-border-button'
                    : 'bg-[#B342FF] hover:bg-purple-700'}`}
              >
                Submit Votes
              </button>
            </div>
          </div>
        </div>


        <Popup
          isOpen={showConfirmation}
          message={`Are you sure you want to vote for ${selectedCandidates.length} candidates?`}
          action="Confirm Vote"
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmVote}
        />


        {error && (
          <div className="fixed bottom-24 right-4 bg-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </RequireAuth>
  );
};


export default MultipleVote;



