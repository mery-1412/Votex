import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); 

  const router = useRouter();
  
  const checkAuth = async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/test-users/getUser", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        console.log("User authenticated:", data);
      } else {
        setUser(false); 
      }
    } catch (error) {
      console.error("Authentication check failed", error);
      setUser(false);
    }
    setIsAuthLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Link wallet to user account
  const linkWallet = async (walletAddress) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/voter/link-wallet',
        { walletAddress },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        await checkAuth(); // Refresh user data to include wallet
        setUser((prevUser) => ({
          ...prevUser,
          walletAddress,
        }));
        return { success: true };
      }
      return { 
        success: false, 
        error: "Failed to link wallet" 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to link wallet' 
      };
    }
  };

  // Check if wallet belongs to current user
  const verifyWallet = async (walletAddress) => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/voter/verify-wallet', 
        {
          params: { walletAddress },
          withCredentials: true
        }
      );
      
      return response.data.isVerified;
    } catch (error) {
      console.error("Error verifying wallet:", error);
      return false;
    }
  };

  // Check if user has already voted
  const checkVoted = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/voter/check-voted',
        { withCredentials: true }
      );
      
      return response.data.hasVoted;
    } catch (error) {
      console.error("Error checking vote status:", error);
      return false;
    }
  };

  // Record that user has voted
  const recordVote = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/voter/record-vote',
        {},
        { withCredentials: true }
      );
      
      return response.data.success;
    } catch (error) {
      console.error("Error recording vote:", error);
      return false;
    }
  };

  // Check if user has linked wallet
  const hasLinkedWallet = () => {
    return user && user.walletAddress ? true : false;
  };

  const logout = async () => {
    try {
      // Try to perform server-side logout
      await axios.post(
        "http://localhost:5000/api/auth/logout", 
        {}, 
        { 
          withCredentials: true,
          timeout: 3000
        }
      );
      console.log("Server logout successful");
    } catch (error) {
      // Handle various error cases
      if (error.response) {
        if (error.response.status === 401) {
          console.log("Session already expired on server");
        } else {
          console.error("Logout failed with status:", error.response.status);
        }
      } else if (error.request) {
        console.error("No response received from server during logout");
      } else {
        console.error("Logout error:", error.message);
      }
    } finally {
      // Always clear local state and redirect regardless of server response
      console.log("Clearing local session");
      setUser(null);
      
  
      
      
      // Redirect to login page
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAuthLoading, 
      checkAuth, 
      logout,
      linkWallet,
      verifyWallet,
      checkVoted,
      recordVote,
      hasLinkedWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
