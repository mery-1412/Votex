import React, { useContext, useState, useEffect } from 'react';
import RequireAdmin from '../protectingRoutes/RequireAdmin';
import { AuthContext } from '../context/AuthContext';
import { VotingContext } from '@/context/Voter';
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import Line from '../../components/Charts/Line';
import BarChart from '../../components/Charts/Bar';
import PieChart from '@/components/Charts/Pie';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const router = useRouter();
  const { user, verifyWallet, linkWallet, logout } = useContext(AuthContext);
  const { currentAccount, connectWallet, connectSmartContract } = useContext(VotingContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [message, setMessage] = useState("");
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  // Chart data
  const sampleData_line = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Votes',
        data: [30, 50, 70, 90],
        fill: false,
        borderColor: '#B342FF',
        tension: 0.4,
      },
    ],
  };
  
  const sampleData_bar = {
    labels: ["candid1", "candid2", "candid3"],
    datasets: [
      {
        label: "Votes",
        data: [12, 19, 3],
        backgroundColor: '#B342FF',
        borderColor: '#B342FF',
        borderWidth: 1,
      },
    ],
  };
  
  const sampleData_pie = {
    labels: ["cand 1", "cand 2", "cand 3"],
    datasets: [
      {
        label: "Votes",
        data: [12, 19, 3],
        backgroundColor: [
          '#B342FF',
          '#C45AFF',
          '#D674FF',
        ],
        borderColor: [
          '#B342FF',
          '#C45AFF',
          '#D674FF',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Update the checkWalletStatus function with admin wallet verification
  const checkWalletStatus = async () => {
    try {
      setWalletError("");
      setMessage("");

      // First check if user is logged in
      if (!user || !user.id) {
        setWalletError("You must be logged in to access admin functions");
        setIsWalletLinked(false);
        return;
      }

      // Then check admin role
      if (user.role !== "admin") {
        setWalletError("Only administrators can access this page");
        setIsWalletLinked(false);
        return;
      }

      // Then check if wallet is connected
      if (!currentAccount) {
        setWalletError("Connect your admin wallet first");
        setIsWalletLinked(false);
        return;
      }
      
      // Check if the connected wallet matches the contract organizer address
      const contract = await connectSmartContract();
      if (!contract) {
        throw new Error("Failed to connect to smart contract");
      }
      
      const organizerAddress = await contract.organizer();
      console.log("Contract organizer address:", organizerAddress);
      console.log("Current connected wallet:", currentAccount);
      
      // Compare addresses case-insensitive
      if (organizerAddress.toLowerCase() !== currentAccount.toLowerCase()) {
        setWalletError("This wallet is not the authorized admin wallet. Please connect with the correct wallet.");
        setIsWalletLinked(false);
        return;
      }

      // Verify wallet is linked to admin account
      const isVerified = await verifyWallet(currentAccount);
      console.log("Wallet verification result:", isVerified, "for account:", currentAccount);

      if (isVerified) {
        setIsWalletLinked(true);
        setWalletError("");
        setMessage("Admin wallet verified successfully");
        // Close the popup when verified
        setShowWalletPopup(false);
      } else {
        setIsWalletLinked(false);
        setWalletError("Admin wallet not linked to your account yet");
      }
    } catch (error) {
      console.error("Error verifying wallet:", error);
      setWalletError("Error verifying wallet ownership: " + error.message);
      setIsWalletLinked(false);
    }
  };

  // Check wallet status when component mounts or when user/account changes
  useEffect(() => {
    const verifyAdminWallet = async () => {
      console.log("Dashboard wallet status:", {
        currentAccount,
        userWallet: user?.walletAddress,
        isAdmin: user?.role === 'admin'
      });
      
      if (user && user.id && currentAccount) {
        await checkWalletStatus();
      } else if (!user || !user.id) {
        setWalletError("You must be logged in to add candidates");
      }
      
      // Show popup if wallet not connected or not linked
      if (user && user.role === "admin" && (!currentAccount || !isWalletLinked)) {
        setShowWalletPopup(true);
      }
    };

    verifyAdminWallet();
  }, [currentAccount, user]);

  const handleConnectWallet = async () => {
    try {
      setMessage("Connecting wallet...");
      setWalletError("");
      
      const connected = await connectWallet();
      if (connected) {
        setMessage("Wallet connected successfully");
        // Wallet status will be checked by useEffect when currentAccount updates
      } else {
        setWalletError("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletError("Failed to connect wallet. Make sure MetaMask is installed and unlocked.");
    }
  };

  // Update the handleLinkWallet function to only allow the correct admin wallet
  const handleLinkWallet = async () => {
    try {
      if (!user || !user.id) {
        setWalletError("Please log in as an admin");
        return;
      }

      if (user.role !== "admin") {
        setWalletError("Only administrators can link the admin wallet");
        return;
      }

      if (!currentAccount) {
        setWalletError("Please connect your wallet first");
        return;
      }

      // Check if the connected wallet matches the contract organizer address
      const contract = await connectSmartContract();
      if (!contract) {
        throw new Error("Failed to connect to smart contract");
      }
      
      const organizerAddress = await contract.organizer();
      console.log("Contract organizer address:", organizerAddress);
      console.log("Current connected wallet:", currentAccount);
      
      // Compare addresses case-insensitive
      if (organizerAddress.toLowerCase() !== currentAccount.toLowerCase()) {
        setWalletError("Only the authorized admin wallet can be linked. Please connect with the correct wallet.");
        return;
      }

      setMessage("Linking admin wallet to account...");
      setWalletError("");

      const result = await linkWallet(currentAccount);
      
      if (result.success) {
        setMessage("Admin wallet linked successfully!");
        // Recheck wallet status after linking
        await checkWalletStatus();
      } else {
        setWalletError(result.error || "Failed to link wallet");
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
      setWalletError("Error linking wallet: " + error.message);
    }
  };

  // Wallet Popup Component
  const WalletPopup = () => {
    if (!showWalletPopup) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Wallet Connection</h2>
            <button 
              onClick={() => setShowWalletPopup(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {!currentAccount ? (
            <div>
              <p className="text-yellow-300 mb-4">Please connect your wallet to manage admin tasks.</p>
              <button
                onClick={handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    isWalletLinked ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <p className={`${isWalletLinked ? "text-green-300" : "text-red-300"}`}>
                  {isWalletLinked ? "Wallet linked to admin account" : "Wallet not linked"}
                </p>
              </div>
              <p className="text-gray-300 text-sm break-all mb-4">{currentAccount}</p>

              {walletError && <p className="text-red-400 mb-4">{walletError}</p>}

              {!isWalletLinked && (
                <button
                  onClick={handleLinkWallet}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
                >
                  Link This Wallet to Admin Account
                </button>
              )}
            </div>
          )}

          {message && <p className="text-green-400 mt-4">{message}</p>}
        </div>
      </div>
    );
  };

  return (
    <RequireAdmin>
      <div className="dashboard-page flex h-screen">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#B342FF]">Dashboard</h2>
            <button 
              onClick={() => setShowWalletPopup(true)}
              className="bg-[#B342FF] hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              {isWalletLinked ? "Wallet Connected" : "Connect Wallet"}
            </button>
          </div>
          
          {/* Charts section */}
          <div className="flex flex-col items-center">
            {/* Top row: Line and Bar charts */}
            <div className="flex flex-wrap justify-center gap-x-2 w-full">
              <div className="w-full max-w-[500px] h-[500px] bg-white rounded-xl px-3 py-2">
                <Line
                  data={sampleData_line}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="w-full max-w-[500px] h-[500px] bg-white rounded-xl px-3 py-2">
                <BarChart
                  data={sampleData_bar}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Wallet Popup */}
        <WalletPopup />
      </div>
    </RequireAdmin>
  );
};

export default Dashboard;