import React, { useContext, useState, useEffect } from 'react';
import { VotingContext } from '@/context/Voter';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from '@/components/NavBar/AdminNavBar';
import Line from '../../components/Charts/Line';
import BarChart from '../../components/Charts/Bar';
import PieChart from '@/components/Charts/Pie';
import { useRouter } from 'next/router';
import RequireAdmin from '../protectingRoutes/RequireAdmin';

const Dashboard = () => {
  const router = useRouter();
  const { user, verifyWallet, linkWallet, logout } = useContext(AuthContext);
  const { 
    currentAccount, 
     connectSmartContract,
    connectWallet, 
    getCurrentSessionData,
    getCurrentSessionCandidates, // Use this instead of getAllCandidates
    getCandidateDetails 
  } = useContext(VotingContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [message, setMessage] = useState("");
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [],
    votes: [],
    candidates: []
  });
  const [voteTimeline, setVoteTimeline] = useState({
    labels: [],
    data: []
  });
  // Add new state for winner
  const [currentWinner, setCurrentWinner] = useState(null);

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

  // Check wallet status logic
  const checkWalletStatus = async () => {
    try {
      setWalletError("");
      setMessage("");

      // First check if user is logged in
      if (!user || !user.id) {
        setWalletError("You must be logged in to add candidates");
        setIsWalletLinked(false);
        return;
      }

      // Then check admin role
      if (user.role !== "admin") {
        setWalletError("Only administrators can add candidates");
        setIsWalletLinked(false);
        return;
      }

      // Then check if wallet is connected
      if (!currentAccount) {
        setWalletError("Connect your admin wallet first");
        setIsWalletLinked(false);
        return;
      }

      // Finally verify wallet
      const isVerified = await verifyWallet(currentAccount);
      console.log("Wallet verification result:", isVerified, "for account:", currentAccount);

      if (isVerified) {
        setIsWalletLinked(true);
        setWalletError("");
        setMessage("Wallet verified and linked to admin account");
        // Close the popup when verified
        setShowWalletPopup(false);
      } else {
        setIsWalletLinked(false);
        setWalletError("This wallet is not linked to your admin account");
      }
    } catch (error) {
      console.error("Error verifying wallet:", error);
      setWalletError("Error verifying wallet ownership");
      setIsWalletLinked(false);
    }
  };

  // Check wallet status when component mounts or when user/account changes
  useEffect(() => {
    const verifyAdminWallet = async () => {
      console.log("Verification state:", {
        isLoggedIn: !!user?.id,
        userRole: user?.role,
        hasWallet: !!currentAccount,
        walletAddress: currentAccount
      });

      // First check if user exists and is logged in
      if (!user || !user.id) {
        setWalletError("You must be logged in to add candidates");
        return;
      }

      // Then check admin role
      if (!user.role || user.role.toLowerCase() !== "admin") {
        setWalletError("Account is not an admin");
        return;
      }

      // Then check wallet connection
      if (!currentAccount) {
        setWalletError("Please connect your wallet");
        return;
      }

      // Finally check wallet verification
      await checkWalletStatus();
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

  const handleLinkWallet = async () => {
    try {

      
      if (!user || !user.id) {
        console.error("USERRRRRRRR", user , user.id, user.role);

        setWalletError("Please log in as an admin");
        return;
      }

      if (!currentAccount) {
        setWalletError("Please connect your wallet first");
        return;
      }

      setMessage("Linking wallet to admin account...");
      setWalletError("");

      const result = await linkWallet(currentAccount);
      
      if (result.success) {
        setMessage("Wallet linked successfully!");
        // Recheck wallet status after linking
        await checkWalletStatus();
      } else {
        setWalletError(result.error || "Failed to link wallet");
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
      setWalletError("Error linking wallet");
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

  // Fetch candidates data for charts
  const fetchCandidatesData = async () => {
    try {
      // Use getCurrentSessionCandidates instead of getAllCandidates
      const candidateAddresses = await getCurrentSessionCandidates();
      
      if (!candidateAddresses || candidateAddresses.length === 0) {
        setChartData({
          labels: [],
          votes: [],
          parties: []
        });
        return;
      }

      const detailedData = await Promise.all(
        candidateAddresses.map(address => getCandidateDetails(address))
      );

      // Filter out any null values from failed fetches
      const validData = detailedData.filter(data => data !== null);

      // Prepare chart data
      const labels = validData.map(c => c.name);
      const votes = validData.map(c => parseInt(c.voteCount));
      const parties = validData.map(c => c.party);

      setChartData({
        labels,
        votes,
        parties
      });

    } catch (error) {
      console.error("Error fetching candidates data:", error);
    }
  };

  // New function to fetch and process vote timeline data
  const fetchVoteTimeline = async () => {
    try {
      const contract = await connectSmartContract();
      if (!contract) return;

      const currentSessionId = await contract.currentSessionId();
      if (currentSessionId.toString() === "0") {
        setVoteTimeline({ labels: [], data: [] });
        return;
      }

      // Get votes per minute data from contract
      const [timePoints, voteCounts] = await contract.getVotesPerMinute(currentSessionId);
      
      // Process and ensure positive values
      const hourlyVotes = new Map();
      
      timePoints.forEach((timestamp, index) => {
        const date = new Date(timestamp.toNumber() * 1000);
        const hourKey = date.toLocaleString('en-US', {
          hour: 'numeric',
          hour12: true,
          day: 'numeric',
          month: 'short'
        });
        
        const votes = Math.max(0, voteCounts[index].toNumber()); // Ensure positive values
        const currentVotes = hourlyVotes.get(hourKey) || 0;
        hourlyVotes.set(hourKey, currentVotes + votes);
      });

      // Sort hours chronologically
      const sortedHours = Array.from(hourlyVotes.keys()).sort((a, b) => 
        new Date(a) - new Date(b)
      );

      // Calculate cumulative votes
      let cumulativeVotes = 0;
      const cumulativeData = sortedHours.map(hour => {
        cumulativeVotes += hourlyVotes.get(hour);
        return cumulativeVotes;
      });

      setVoteTimeline({
        labels: sortedHours,
        data: cumulativeData // Use cumulative votes
      });

    } catch (error) {
      console.error("Error fetching vote timeline:", error);
      setVoteTimeline({ labels: [], data: [] });
    }
  };





  // Update the fetchCurrentWinner function
  // Update the fetchCurrentWinner function
const fetchCurrentWinner = async () => {
  try {
    const contract = await connectSmartContract();
    if (!contract) return;

    // Get current session ID and details
    const sessionId = await contract.currentSessionId();
    console.log("CURRENNNNNNNTTTT QZQQUIN session ID:", sessionId.toString());
    if (sessionId.toString() === "0") {
      setCurrentWinner(null);
      return;
    }

    const session = await contract.getSession(sessionId);
    if (!session) {
      setCurrentWinner(null);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const endTime = session.endPeriod.toNumber();

    console.log("Session end time:", new Date(endTime * 1000));
    console.log("Current time:", new Date(now * 1000));
    console.log("Session has ended:", now > endTime);

    if (now <= endTime) {
      console.log("Session still active or hasn't started");
      setCurrentWinner(null);
      return;
    }

    try {
      // Get winner address and data separately
      const winnerAddress = await contract.getCurrentSessionWinner();
      console.log("WINNNNERRRRRRRRRRRRRRRRRRRRRRRRR address:", winnerAddress);

      // Check if winner address is valid
      if (!winnerAddress || winnerAddress === "0x0000000000000000000000000000000000000000") {
        console.log("No winner address available");
        setCurrentWinner(null);
        return;
      }

      // Get candidate details using the winner address
      const winnerData = await contract.getCandidateData(winnerAddress);
      console.log("Raw winner data:", winnerData);

      // Extract the required fields from the array response
      setCurrentWinner({
        name: winnerData[1], // name is at index 1
        party: winnerData[3], // party is at index 3
        imageUrl: winnerData[4], // imageUrl is at index 4
        voteCount: winnerData[5] ? winnerData[5].toString() : "0" // voteCount is at index 5
      });

      console.log("Winner data processed successfully");

    } catch (winnerError) {
      console.error("Error processing winner data:", winnerError);
      setCurrentWinner(null);
    }
  } catch (error) {
    console.error("Error fetching winner:", error);
    setCurrentWinner(null);
  }
};

// Update the useEffect to check for winner periodically
useEffect(() => {
  if (currentAccount) {
    fetchCandidatesData();
    fetchVoteTimeline();
    fetchCurrentWinner();

    // Check every minute for updates
    const interval = setInterval(() => {
      fetchCurrentWinner();
    }, 60000);

    return () => clearInterval(interval);
  }
}, [currentAccount]);

  // Add an interval to check for winner regularly
  useEffect(() => {
    if (currentAccount) {
      fetchCandidatesData();
      fetchVoteTimeline();
      fetchCurrentWinner();

      // Check every minute for updates
      const interval = setInterval(() => {
        fetchCurrentWinner();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentAccount]);

  // Update the chartData_line object
  const chartData_line = {
    labels: voteTimeline.labels,
    datasets: [{
      label: 'Total Votes',
      data: voteTimeline.data,
      fill: false,
      borderColor: '#B342FF',
      tension: 0.4,
    }]
  };

  const chartData_bar = {
    labels: chartData.labels,
    datasets: [{
      label: 'Votes',
      data: chartData.votes,
      backgroundColor: '#B342FF',
      borderColor: '#B342FF',
      borderWidth: 1,
    }]
  };

  const chartData_pie = {
    labels: chartData.labels,
    datasets: [{
      label: 'Votes',
      data: chartData.votes,
      backgroundColor: [
        '#B342FF',
        '#C45AFF',
        '#D674FF',
        '#E98EFF',
        '#FAA8FF',
      ],
      borderColor: [
        '#B342FF',
        '#C45AFF',
        '#D674FF',
        '#E98EFF',
        '#FAA8FF',
      ],
      borderWidth: 1,
    }]
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
          
          {/* Winner Card */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">Current Session Winner</h3>
            {currentWinner ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Winner Image */}
                  <div className="w-full md:w-1/3 h-64 relative">
                    <img
                      src={currentWinner.imageUrl}
                      alt={currentWinner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Winner Details */}
                  <div className="w-full md:w-2/3 p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-3">👑</span>
                      <h4 className="text-2xl font-bold text-purple-800">{currentWinner.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Party</p>
                        <p className="text-lg font-semibold text-purple-800">{currentWinner.party}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Total Votes</p>
                        <p className="text-lg font-semibold text-purple-800">{currentWinner.voteCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">No winner yet. The winner will be displayed here once the voting session ends.</p>
              </div>
            )}
          </div>

          {/* Charts section */}
          <div className="flex flex-col items-center">
  <div className="flex flex-wrap justify-center gap-4 w-full mb-4">
    {/* Line Chart */}
    <div className="w-full md:w-[48%] bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-2 text-purple-600">Votes Timeline</h3>
      <div className="h-[400px]">
        <Line
          data={chartData_line}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: (context) => `Total Votes: ${Math.max(0, context.parsed.y)}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                suggestedMax: Math.max(...(voteTimeline.data || [0])) + 1,
                ticks: {
                  stepSize: 1,
                  precision: 0,
                  callback: (value) => Math.max(0, parseInt(value))
                },
                grid: {
                  drawBorder: false
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }}
        />
      </div>
    </div>

    {/* Bar Chart */}
    <div className="w-full md:w-[48%] bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-2 text-purple-600">Vote Distribution</h3>
      <div className="h-[400px]">
        <BarChart
          data={chartData_bar}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Votes'
                }
              }
            }
          }}
        />
      </div>
    </div>
  </div>

  {/* Add total votes summary */}
  <div className="w-full max-w-3xl mt-4 p-4 bg-white rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold mb-4 text-purple-600">Voting Summary</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-600">Total Candidates</p>
        <p className="text-2xl font-bold text-purple-800">{chartData.labels.length}</p>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-600">Total Votes</p>
        <p className="text-2xl font-bold text-purple-800">
          {chartData.votes.reduce((a, b) => a + b, 0)}
        </p>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-600">Leading Candidate</p>
        <p className="text-2xl font-bold text-purple-800">
          {chartData.labels[chartData.votes.indexOf(Math.max(...chartData.votes))] || 'N/A'}
        </p>
      </div>
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