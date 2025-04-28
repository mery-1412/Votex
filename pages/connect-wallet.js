import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { VotingContext } from "@/context/Voter";
import { AuthContext } from "./context/AuthContext";
import RequireAuth from "./protectingRoutes/RequireAuth";

const ConnectWallet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { connectWallet, currentAccount } = useContext(VotingContext);
  const { user, linkWallet } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (user === false) {
      router.push("/auth/Login");
    }
  }, [user, router]);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const connected = await connectWallet();
      
      if (!connected) {
        setError("Failed to connect wallet. Make sure MetaMask is installed and unlocked.");
        setIsLoading(false);
        return;
      }
      
      // Success - show link wallet option
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError("An error occurred while connecting your wallet.");
    }
    
    setIsLoading(false);
  };

  const handleLinkWallet = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (!currentAccount) {
        setError("Please connect your wallet first.");
        setIsLoading(false);
        return;
      }
      
      const result = await linkWallet(currentAccount);
      
      if (result.success) {
        // Redirect to user home after successful wallet linking
        router.push("/home-user");
      } else {
        setError(result.error || "Failed to link wallet.");
      }
    } catch (err) {
      console.error("Wallet linking error:", err);
      setError("An error occurred while linking your wallet.");
    }
    
    setIsLoading(false);
  };

  const handleSkip = () => {
    router.push("/home-user");
  };

  return (
    <RequireAuth>
      <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
          <h2 className="text-2xl mb-4">Connect Your Wallet</h2>
          <p className="mb-6">Link your blockchain wallet to vote in the election.</p>
          
          {!currentAccount ? (
            <div>
              <button 
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="gradient-border-button w-full"
              >
                {isLoading ? "Connecting..." : "Connect MetaMask"}
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-4">Wallet connected: <br />
                <span className="text-sm break-all">{currentAccount}</span>
              </p>
              <button 
                onClick={handleLinkWallet}
                disabled={isLoading}
                className="gradient-border-button w-full"
              >
                {isLoading ? "Linking..." : "Link This Wallet to My Account"}
              </button>
            </div>
          )}
          
          {error && <p className="text-red-300 mt-4">{error}</p>}
          
          <p className="mt-6 text-sm">
            <button 
              onClick={handleSkip}
              className="text-gray-300 hover:text-white"
            >
              Skip for now (you'll need to connect later to vote)
            </button>
          </p>
        </div>
      </div>
    </RequireAuth>
  );
};

export default ConnectWallet;