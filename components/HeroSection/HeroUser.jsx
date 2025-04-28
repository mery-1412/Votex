import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/pages/context/AuthContext';
import { VotingContext } from '@/context/Voter';
import { FaEthereum } from "react-icons/fa";
import WalletManager from '../WalletManager'; // Make sure to create this component

const HeroUser = () => {
  const { user, isAuthLoading } = useContext(AuthContext);
  const { currentAccount, hasVoted } = useContext(VotingContext);
  const [float, setFloat] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFloat((prev) => !prev);
    }, 2000); // Animation every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isAuthLoading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-white">Loading...</p>
      </section>
    );
  }
  
  if (!user) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-white">Please log in to access this page.</p>
      </section>
    );
  }
  
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 text-white min-h-screen">
      {/* Left Side */}
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          Welcome To VoteX
        </h1>
        <p className="text-xl text-gray-300 mb-4">ID: {user.idNumber}</p>
        <p className="text-lg text-gray-400 mt-4 mb-6">
          Explore the power of Ethereum and blockchain technology for secure and transparent voting.
        </p>
        
        {/* Wallet Connection Status */}
        <div className="mt-8 mb-6">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${currentAccount ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <h3 className="text-xl font-semibold">
              Wallet Status: {currentAccount ? 'Connected' : 'Not Connected'}
            </h3>
          </div>
          
          {currentAccount && (
            <p className="text-sm text-gray-300 mb-4 break-all">
              {currentAccount}
            </p>
          )}
          
          <button 
            onClick={() => setShowWalletManager(!showWalletManager)} 
            className="gradient-border-button mt-2"
          >
            {showWalletManager ? 'Hide Wallet Manager' : 'Manage Wallet Connection'}
          </button>
          
          {showWalletManager && (
            <div className="mt-6 p-5 bg-black bg-opacity-30 backdrop-blur-md rounded-lg border border-white border-opacity-20">
              <WalletManager />
            </div>
          )}
        </div>
        
        {/* Voting Status */}
        <div className="mt-8">
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${hasVoted ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
            <h3 className="text-xl font-semibold">
              Voting Status: {hasVoted ? 'You have voted' : 'You have not voted yet'}
            </h3>
          </div>
          
          {!hasVoted && currentAccount && (
            <p className="text-gray-300 mt-2">
              You can now proceed to the voting section to cast your vote.
            </p>
          )}
        </div>
      </div>
      
      {/* Right Side (Ethereum Icon) */}
      <div className="relative mt-10 md:mt-0">
        <div
          className={`transition-transform duration-1000 ${
            float ? "translate-y-4" : "-translate-y-4"
          }`}
        >
          <svg width="0" height="0">
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c03bfa" />
                <stop offset="50%" stopColor="#8a2be2" />
                <stop offset="100%" stopColor="#4293ea" />
              </linearGradient>
              {/* Neon Glow Filter */}
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                <feMerge>
                  <feMergeNode in="offsetBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
                <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#c03bfa" floodOpacity="0.8" />
                <feDropShadow dx="0" dy="0" stdDeviation="25" floodColor="#4293ea" floodOpacity="0.6" />
              </filter>
              {/* Moving Bottom Shadow */}
              <filter id="movingShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy={float ? "20" : "10"} // Adjust shadow position based on float state
                  stdDeviation="15"
                  floodColor="rgba(0, 0, 0, 0.7)"
                />
              </filter>
            </defs>
          </svg>
          <FaEthereum
            style={{
              fill: "url(#grad1)", // Gradient color
              filter: "url(#neonGlow) url(#movingShadow)", // Apply neon glow and moving shadow
              width: "300px", // Bigger size
              height: "300px",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroUser;
