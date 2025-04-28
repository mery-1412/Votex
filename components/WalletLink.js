import React, { useContext, useState, useEffect } from 'react';
import { VotingContext } from '../context/Voter';
import { AuthContext } from '../pages/context/AuthContext';

const WalletLink = () => {
  const { currentAccount, connectWallet } = useContext(VotingContext);
  const { user, linkWallet } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isWalletLinked, setIsWalletLinked] = useState(false);

  useEffect(() => {
    // Check if user has a linked wallet
    if (user && user.walletAddress) {
      setIsWalletLinked(true);
      
      // Check if connected wallet matches linked wallet
      if (currentAccount && currentAccount.toLowerCase() !== user.walletAddress.toLowerCase()) {
        setError(`Warning: Connected wallet doesn't match your linked wallet. Please connect ${user.walletAddress}`);
      } else {
        setError('');
      }
    } else {
      setIsWalletLinked(false);
    }
  }, [user, currentAccount]);

  const handleLinkWallet = async () => {
    setMessage('');
    setError('');
    
    if (!currentAccount) {
      const connected = await connectWallet();
      if (!connected) {
        setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
        return;
      }
    }
    
    try {
      const result = await linkWallet(currentAccount);
      if (result.success) {
        setMessage("Wallet linked successfully!");
        setIsWalletLinked(true);
      } else {
        setError(result.error || "Failed to link wallet.");
      }
    } catch (err) {
      setError("An error occurred while linking your wallet.");
      console.error(err);
    }
  };
  
  const handleConnectWallet = async () => {
    setMessage('');
    setError('');
    
    const connected = await connectWallet();
    if (!connected) {
      setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-30">
      <h2 className="text-xl mb-4">Wallet Connection</h2>
      
      {!currentAccount ? (
        <div>
          <p className="mb-4">Connect your wallet to vote.</p>
          <button 
            onClick={handleConnectWallet} 
            className="gradient-border-button"
          >
            Connect Wallet
          </button>
        </div>
      ) : isWalletLinked ? (
        <div>
          <p className="mb-2">Connected wallet:</p>
          <p className="text-sm text-gray-300 break-all mb-4">{currentAccount}</p>
          
          {user && user.walletAddress && (
            <>
              <p className="mb-2">Linked wallet:</p>
              <p className="text-sm text-gray-300 break-all">{user.walletAddress}</p>
            </>
          )}
          
          {user && user.walletAddress && user.walletAddress.toLowerCase() !== currentAccount.toLowerCase() && (
            <button 
              onClick={handleLinkWallet} 
              className="gradient-border-button mt-4"
            >
              Update Linked Wallet
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-2">Connected wallet:</p>
          <p className="text-sm text-gray-300 break-all mb-4">{currentAccount}</p>
          <p className="mb-4 text-amber-300">You need to link this wallet to your account to vote.</p>
          
          <button 
            onClick={handleLinkWallet} 
            className="gradient-border-button"
          >
            Link Wallet to Account
          </button>
        </div>
      )}
      
      {message && <p className="text-green-300 mt-4">{message}</p>}
      {error && <p className="text-red-300 mt-4">{error}</p>}
    </div>
  );
};

export default WalletLink;