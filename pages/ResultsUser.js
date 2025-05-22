import React, { useState, useEffect, useContext } from 'react';
import { VotingContext } from '../context/Voter';
import UserNavBar from '../components/NavBar/UserNavBar';
import RequireAuth from './protectingRoutes/RequireAuth';
import Image from 'next/image';

const ResultsUser = () => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [winner, setWinner] = useState(null);
  const [votingEnded, setVotingEnded] = useState(false);
  const { getVotingPeriod, getAllCandidates, getCandidateDetails } = useContext(VotingContext);

  // Format time function from Countdown component
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 justify-center items-center py-6 max-w-[900px] mx-auto">
        {[
          {
            label: "days",
            value: days
          },
          {
            label: "hours",
            value: hours
          },
          {
            label: "minutes",
            value: minutes
          },
          {
            label: "seconds",
            value: seconds
          }
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#B342FF] rounded-2xl text-white w-[clamp(120px,20vw,160px)] h-[clamp(120px,20vw,160px)] flex flex-col items-center justify-center text-[clamp(2rem,5vw,3rem)] font-bold shadow-lg transition-transform duration-200 ease-in-out hover:scale-105"
          >
            {value.toString().padStart(2, "0")}
            <span className="text-white text-[clamp(0.85rem,2vw,1rem)] tracking-wide uppercase mt-2 font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Fetch voting period and check for winner
  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const periodData = await getVotingPeriod();
        if (periodData?.end) {
          const endTime = new Date(periodData.end * 1000).getTime();
          const now = new Date().getTime();
          const remaining = endTime - now;

          if (remaining <= 0) {
            setVotingEnded(true);
            const candidates = await getAllCandidates();
            if (candidates && candidates.length > 0) {
              // Find winner (candidate with most votes)
              let maxVotes = 0;
              let winningCandidate = null;
              
              for (const candidate of candidates) {
                const details = await getCandidateDetails(candidate._address);
                if (details && parseInt(details.voteCount) > maxVotes) {
                  maxVotes = parseInt(details.voteCount);
                  winningCandidate = {
                    ...details,
                    imageUrl: `https://gateway.pinata.cloud/ipfs/${details.ipfs}`
                  };
                }
              }
              setWinner(winningCandidate);
            }
          } else {
            setTimeRemaining(remaining);
          }
        }
      } catch (error) {
        console.error("Error checking voting status:", error);
      }
    };

    checkVotingStatus();
    const interval = setInterval(checkVotingStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2d1f4f]">
        <UserNavBar />
        <div className="container mx-auto px-4 pt-20">
          <h1 className="text-4xl font-bold text-center text-white mb-10 mt-10">
            Voting Results
          </h1>

          {!votingEnded ? (
            <div className="text-center">
              <h2 className="text-2xl text-white mb-8">Time Remaining Until Results</h2>
              {formatTime(timeRemaining)}
            </div>
          ) : winner ? (
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-center text-white mb-8 flex items-center justify-center">
                <span className="text-4xl mr-2">👑</span> 
                Winner Announced!
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 rounded-lg p-6">
                {/* Winner Image */}
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-xl">
                  <Image
                    src={winner.imageUrl}
                    alt={winner.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                
                {/* Winner Details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-bold text-white mb-4">{winner.name}</h3>
                  <p className="text-xl text-purple-300 mb-6">{winner.party}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-900/30 px-6 py-4 rounded-lg">
                      <p className="text-purple-300 text-sm">Total Votes</p>
                      <p className="text-3xl font-bold text-white">{winner.voteCount}</p>
                    </div>
                    <div className="bg-purple-900/30 px-6 py-4 rounded-lg">
                      <p className="text-purple-300 text-sm">Age</p>
                      <p className="text-3xl font-bold text-white">{winner.age}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <p className="text-xl">No winner has been determined yet.</p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
};

export default ResultsUser;
