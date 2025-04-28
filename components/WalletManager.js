import React, { useContext, useState } from 'react';
import { VotingContext } from '../context/Voter';
import { AuthContext } from '../pages/context/AuthContext';

const WalletManager = () => {
  const { currentAccount, connectWallet } = useContext(VotingContext);
  const { user, linkWallet, verifyWallet } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    setMessage('');
    setError('');
    
    try {
      const connected = await connectWallet();
      if (!connected) {
        setError("Failed to connect wallet. Make sure MetaMask is installed and unlocked.");
        return;
      }
      
      setMessage("Wallet connected successfully!");
    } catch (err) {
      setError("Error connecting wallet.");
      console.error(err);
    }
  };

  const handleLinkWallet = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first.");
      return;
    }
    
    setMessage('');
    setError('');
    
    try {
      const isVerified = await verifyWallet(currentAccount);
      if (isVerified) {
        setMessage("This wallet is already linked to your account.");
        return;
      }
      
      const result = await linkWallet(currentAccount);
      if (result.success) {
        setMessage("Wallet linked successfully!");
      } else {
        setError(result.error || "Failed to link wallet.");
      }
    } catch (err) {
      setError("Error linking wallet.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-30">
      <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
      
      {!currentAccount ? (
        <div>
          <p className="mb-4">Connect your wallet to participate in voting.</p>
          <button 
            onClick={handleConnectWallet} 
            className="gradient-border-button w-full"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2">Connected Wallet:</p>
          <p className="text-sm text-gray-300 break-all mb-4">{currentAccount}</p>
          
          {user && user.walletAddress ? (
            <>
              <p className="mb-2">Linked Wallet:</p>
              <p className="text-sm text-gray-300 break-all mb-4">{user.walletAddress}</p>
              
              {user.walletAddress.toLowerCase() !== currentAccount.toLowerCase() && (
                <>
                  <p className="text-amber-300 mb-3">
                    Warning: Your current wallet doesn't match your linked wallet.
                  </p>
                  <button 
                    onClick={handleLinkWallet} 
                    className="gradient-border-button w-full"
                  >
                    Update Linked Wallet
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <p className="mb-4">You need to link this wallet to your account to vote.</p>
              <button 
                onClick={handleLinkWallet} 
                className="gradient-border-button w-full"
              >
                Link Wallet to Account
              </button>
            </>
          )}
        </div>
      )}
      
      {message && <p className="text-green-300 mt-4">{message}</p>}
      {error && <p className="text-red-300 mt-4">{error}</p>}
    </div>
  );
};

export default WalletManager;