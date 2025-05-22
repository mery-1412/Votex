import React, { useState, useEffect, useContext } from "react";
import { VotingContext } from "@/context/Voter";
import { ethers } from "ethers";

const Countdown = ({ checkWalletVerification }) => {
  // Basic states
  const [eventEndDate, setEventEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [transactionPending, setTransactionPending] = useState(false);
  
  // Debug states
  const [debugInfo, setDebugInfo] = useState({
    isOrganizer: false,
    activeCandidatesCount: 0,
    currentSessionId: 0,
    isVotingActive: false,
    walletAddress: ""
  });
  
  // Countdown states
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  // Voting period state
  const [votingPeriodActive, setVotingPeriodActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Add this state
  const [endingSession, setEndingSession] = useState(false);
  
  // Get context
  const { getVotingPeriod, connectSmartContract } = useContext(VotingContext);

  // Check voting period on load and refresh
  useEffect(() => {
    checkVotingPeriod();
    checkContractState();
    
    // Refresh every minute
    const interval = setInterval(() => {
      checkVotingPeriod();
      checkContractState();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // New function to check contract state for debugging
  const checkContractState = async () => {
    try {
      const contract = await connectSmartContract();
      if (!contract) return;

      // Get current wallet address
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Check if current user is organizer
      let isOrganizer = false;
      try {
        const organizerAddress = await contract.organizer();
        isOrganizer = organizerAddress.toLowerCase() === walletAddress.toLowerCase();
      } catch (err) {
        console.log("Could not get organizer address:", err);
      }

      // Get active candidates count
      let activeCandidatesCount = 0;
      try {
        const candidates = await contract.getActiveCandidates();
        activeCandidatesCount = candidates.length;
      } catch (err) {
        console.log("Could not get active candidates:", err);
        // Try alternative method if getActiveCandidates doesn't exist
        try {
          const candidatesArray = await contract.activeCandiates(); // Note: your contract has a typo "activeCandiates"
          activeCandidatesCount = candidatesArray.length;
        } catch (err2) {
          console.log("Could not get activeCandiates array:", err2);
        }
      }

      // Get current session info
      let currentSessionId = 0;
      let isVotingActive = false;
      try {
        currentSessionId = await contract.currentSessionId();
        isVotingActive = await contract.isVotingActive();
      } catch (err) {
        console.log("Could not get session info:", err);
      }

      setDebugInfo({
        isOrganizer,
        activeCandidatesCount,
        currentSessionId: currentSessionId.toString(),
        isVotingActive,
        walletAddress
      });

    } catch (error) {
      console.error("Error checking contract state:", error);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!votingPeriodActive || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const end = endTime * 1000;
      const remaining = end - now;
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
        
        // Update time units
        const totalSeconds = Math.floor(remaining / 1000);
        setDays(Math.floor(totalSeconds / (3600 * 24)));
        setHours(Math.floor((totalSeconds % (3600 * 24)) / 3600));
        setMinutes(Math.floor((totalSeconds % 3600) / 60));
        setSeconds(totalSeconds % 60);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [votingPeriodActive, endTime, endingSession]);

  // Main function to check if voting period is active
  const checkVotingPeriod = async () => {
    setLoading(true);
    setError("");
    try {
      const contract = await connectSmartContract();
      if (!contract) {
        setLoading(false);
        return;
      }

      // Check if voting is active according to contract
      const isVotingActive = await contract.isVotingActive();
      console.log("Contract says voting is active:", isVotingActive);
      
      if (!isVotingActive) {
        console.log("No active voting period according to contract");
        setVotingPeriodActive(false);
        setLoading(false);
        return;
      }

      // Get current session data
      const currentSessionId = await contract.currentSessionId();
      console.log("Current session ID:", currentSessionId.toString());
      
      if (currentSessionId.toString() === "0") {
        console.log("No current session");
        setVotingPeriodActive(false);
        setLoading(false);
        return;
      }

      // Get session details
      const session = await contract.getSession(currentSessionId);
      console.log("Session data:", session);
      
      const start = session.startPeriod;
      const end = session.endPeriod;
      const sessionActive = session.isActive;
      
      console.log("Session start:", start.toString());
      console.log("Session end:", end.toString());
      console.log("Session active:", sessionActive);
      
      const now = Math.floor(Date.now() / 1000);
      console.log(`Current time: ${now}, Start: ${start}, End: ${end}`);
      console.log(`Current: ${new Date(now * 1000).toLocaleString()}`);
      console.log(`Start: ${new Date(start * 1000).toLocaleString()}`);
      console.log(`End: ${new Date(end * 1000).toLocaleString()}`);
      
      // Even if actual voting hasn't started, if contract says voting is active,
      // we'll show the UI but with appropriate messaging
      setVotingPeriodActive(isVotingActive);
      setStartTime(start);
      setEndTime(end);
      
      // Update time remaining based on where we are in the timeline
      if (now < start) {
        // Voting scheduled but not started yet
        const remaining = start * 1000 - Date.now();
        setTimeRemaining(remaining > 0 ? remaining : 0);
      } else if (now <= end) {
        // Active voting period
        const remaining = end * 1000 - Date.now();
        setTimeRemaining(remaining > 0 ? remaining : 0);
      } else {
        // Voting period has ended
        setTimeRemaining(0);
        
        // Check if voting period has ended but contract state hasn't been updated
        if (isVotingActive && now > end && !endingSession) {
          console.log("Voting period has ended but contract still shows active");
          
          try {
            setEndingSession(true);  // Set flag
            console.log("Calling checkSessionStatus() to end session...");
            
            // This will update the contract state to reflect the session has ended
            await contract.checkSessionStatus();
            console.log("Session status updated");
            
            // Wait a bit before checking again to allow blockchain to update
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Re-check after status update
            await checkVotingPeriod();
            await checkContractState();
          } catch (err) {
            console.error("Error updating session status:", err);
          } finally {
            // Delay resetting the flag to prevent rapid re-attempts
            setTimeout(() => {
              setEndingSession(false);
              console.log("Reset endingSession flag");
            }, 30000); // 30 seconds cooldown
          }
        }
      }
      
    } catch (error) {
      console.error("Error checking voting period:", error);
      setError("Failed to check voting period status");
      
      // Fallback: try the original method
      try {
        const periodData = await getVotingPeriod();
        console.log("Fallback voting period data:", periodData);
        
        if (periodData && periodData.start && periodData.end) {
          const now = Math.floor(Date.now() / 1000);
          const start = periodData.start;
          const end = periodData.end;
          const isActive = now >= start && now <= end;
          
          setVotingPeriodActive(isActive);
          setStartTime(start);
          setEndTime(end);
          
          if (isActive) {
            const remaining = end * 1000 - Date.now();
            setTimeRemaining(remaining > 0 ? remaining : 0);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a scheduled check in the useEffect that checks if we need to call checkSessionStatus
  useEffect(() => {
    // Only run this effect when voting is active and we have an end time
    if (!votingPeriodActive || !endTime) return;
    
    const now = Math.floor(Date.now() / 1000);
    
    // If we're past the end time and voting is still active, schedule a single check
    if (now > endTime) {
      // Check if the session needs updating, but only if we're not already doing it
      if (!endingSession) {
        checkVotingPeriod();
      }
    } else {
      // If we're not past the end time yet, schedule a check for when we reach the end time
      const timeUntilEnd = (endTime - now) * 1000;
      const timeout = setTimeout(() => {
        checkVotingPeriod();
      }, timeUntilEnd + 1000); // Add 1 second buffer
      
      return () => clearTimeout(timeout);
    }
  }, [votingPeriodActive, endTime, endingSession]);

  // Pre-flight checks before submitting
  const runPreflightChecks = async () => {
    const checks = [];
    
    // Check if user is organizer
    if (!debugInfo.isOrganizer) {
      checks.push("❌ You are not the organizer of this contract");
    } else {
      checks.push("✅ You are the organizer");
    }
    
    // Check if there are active candidates
    if (debugInfo.activeCandidatesCount === 0) {
      checks.push("❌ No active candidates found");
    } else {
      checks.push(`✅ ${debugInfo.activeCandidatesCount} active candidates found`);
    }
    
    // Check if voting is already active
    if (debugInfo.isVotingActive) {
      checks.push("❌ A voting period is already active - cannot set a new one");
    } else {
      checks.push("✅ No active voting period");
    }
    
    return checks;
  };

  // Submit new voting period with enhanced debugging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isVerified = await checkWalletVerification();
    if (!isVerified) return;

    if (!eventEndDate) {
      setError("Please set an end date");
      return;
    }

    // Run preflight checks
    const preflightChecks = await runPreflightChecks();
    const hasErrors = preflightChecks.some(check => check.includes("❌"));
    
    if (hasErrors) {
      setError(`Preflight checks failed:\n${preflightChecks.join('\n')}`);
      return;
    }

    const endTimeMs = new Date(eventEndDate).getTime();
    const currentTime = Date.now();
    
    if (endTimeMs <= currentTime) {
      setError("End date must be in the future");
      return;
    }

    try {
      setTransactionPending(true);

      const now = Math.floor(currentTime / 1000);
      const startTimestamp = now + 120; // 2 minutes from actual current time
      const endTimestamp = Math.floor(endTimeMs / 1000);

      // Enhanced validation
      if (endTimestamp <= startTimestamp) {
        setError("End time must be after start time");
        return;
      }

      if (endTimestamp < startTimestamp + 300) {
        setError("Voting period must be at least 5 minutes long");
        return;
      }

      if (startTimestamp <= now) {
        setError("Start time must be in the future");
        return;
      }

      console.log("=== TRANSACTION DEBUG INFO ===");
      console.log(`Wallet Address: ${debugInfo.walletAddress}`);
      console.log(`Is Organizer: ${debugInfo.isOrganizer}`);
      console.log(`Active Candidates: ${debugInfo.activeCandidatesCount}`);
      console.log(`Current Session ID: ${debugInfo.currentSessionId}`);
      console.log(`Is Voting Active: ${debugInfo.isVotingActive}`);
      console.log(`Current timestamp: ${now}`);
      console.log(`Start timestamp: ${startTimestamp}`);
      console.log(`End timestamp: ${endTimestamp}`);
      console.log(`Start: ${new Date(startTimestamp * 1000).toLocaleString()}`);
      console.log(`End: ${new Date(endTimestamp * 1000).toLocaleString()}`);

      const contract = await connectSmartContract();
      if (!contract) throw new Error("Failed to connect to contract");

      // Try to estimate gas first to catch errors early
      try {
        const gasEstimate = await contract.estimateGas.setVotingPeriod(startTimestamp, endTimestamp);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        console.log("Full gas error:", gasError);
        
        // Try to decode the revert reason
        if (gasError.data) {
          try {
            const reason = ethers.utils.toUtf8String('0x' + gasError.data.slice(138));
            console.log("Decoded revert reason:", reason);
            throw new Error(`Contract revert: ${reason}`);
          } catch (decodeError) {
            console.log("Could not decode revert reason");
          }
        }
        
        throw new Error(`Transaction will fail: ${gasError.reason || gasError.message}`);
      }

      // Try with different gas settings
      const tx = await contract.setVotingPeriod(startTimestamp, endTimestamp, {
        gasLimit: 800000, // Increased gas limit
        type: 2, // EIP-1559 transaction
      });

      console.log("Transaction sent:", tx.hash);
      
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Transaction timeout")), 60000)
        )
      ]);
      
      console.log("Transaction confirmed:", receipt);

      setEventEndDate("");
      await checkVotingPeriod();
      await checkContractState();
      
    } catch (error) {
      console.error("Transaction failed:", error);
      
      let errorMessage = "Failed to set voting period";
      
      if (error.message.includes("No active candidates") || error.message.includes("activeCandiates.length")) {
        errorMessage = "No active candidates available for voting. Please add candidates first.";
      } else if (error.message.includes("A voting period is already active")) {
        errorMessage = "A voting period is already active";
      } else if (error.message.includes("Start time must be in the future")) {
        errorMessage = "Start time must be in the future";
      } else if (error.message.includes("Start time must be before end time")) {
        errorMessage = "Start time must be before end time";
      } else if (error.message.includes("only organizer")) {
        errorMessage = "Only the contract organizer can set voting periods";
      } else if (error.reason) {
        errorMessage = `Contract error: ${error.reason}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setTransactionPending(false);
    }
  };



  // Helper functions
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 3);
    return now.toISOString().slice(0, 16);
  };

  const getStartTimeDisplay = () => {
    const startTime = new Date(Date.now() + 120000);
    return startTime.toLocaleString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  // Render countdown when voting is active
  if (votingPeriodActive) {
    const now = Math.floor(Date.now() / 1000);
    const votingStarted = now >= startTime;
    const votingEnded = now > endTime;
    
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Header changes based on status */}
        {!votingStarted ? (
          <h2 className="text-2xl font-bold mb-2 text-center text-purple-600">Voting Scheduled</h2>
        ) : votingEnded ? (
          <h2 className="text-2xl font-bold mb-2 text-center text-red-600">Voting Period Ended</h2>
        ) : (
          <h2 className="text-2xl font-bold mb-2 text-center text-purple-700">Voting in Progress</h2>
        )}
        
      
        
        <div className="flex flex-wrap justify-center gap-4 mb-6 w-full max-w-[700px]">
          <div className="bg-white shadow rounded-xl px-6 py-4 flex-1">
            <h3 className="text-purple-700 font-semibold mb-2">Start Time:</h3>
            <p className="text-gray-800">
              {new Date(startTime * 1000).toLocaleString()}
              {!votingStarted && (
                <span className="block text-xs mt-1 text-purple-600 font-bold">Voting starts in:</span>
              )}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl px-6 py-4 flex-1">
            <h3 className="text-purple-700 font-semibold mb-2">End Time:</h3>
            <p className="text-gray-800">
              {new Date(endTime * 1000).toLocaleString()}
              {votingStarted && !votingEnded && (
                <span className="block text-xs mt-1 text-purple-600 font-bold">Voting ends in:</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Countdown label changes based on status */}
        {!votingStarted ? (
          <h3 className="text-xl font-semibold mb-4 text-center text-purple-600">Time Until Voting Begins</h3>
        ) : votingEnded ? (
          <h3 className="text-xl font-semibold mb-4 text-center text-red-600">Voting Period Has Ended</h3>
        ) : (
          <h3 className="text-xl font-semibold mb-4 text-center text-purple-600">Time Remaining</h3>
        )}
        
        {/* Countdown timer - colors change based on status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-[700px]">
          {[
            { label: "Days", value: days },
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds }
          ].map(({ label, value }) => (
            <div 
              key={label} 
              className={`rounded-xl p-4 text-center text-white ${
                !votingStarted ? "bg-purple-700" : 
                votingEnded ? "bg-red-500" : 
                "bg-purple-700"
              }`}
            >
              <div className="text-3xl font-bold">{value.toString().padStart(2, "0")}</div>
              <div className="text-sm uppercase mt-1">{label}</div>
            </div>
          ))}
        </div>
        
        {/* Add the End Session button - only visible to organizers when voting is active */}
        {debugInfo.isOrganizer && (
          <div className="mt-8 w-full max-w-[700px]">
            
          
          </div>
        )}
        
        {error && (
          <div className="w-full max-w-[700px] mt-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
            <strong>Error:</strong>
            <pre className="whitespace-pre-wrap mt-2 text-sm">{error}</pre>
          </div>
        )}
      </div>
    );
  }
  
  // Render form when no active voting period
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <h2 className="text-2xl font-bold mb-3 text-center">Set Voting Period</h2>
      <p className="text-gray-600 mb-6 text-center max-w-[600px]">
        There is currently no active voting period. Set a new voting period to begin.
      </p>
      
      {/* Debug Information Panel */}
      <div className="w-full max-w-[600px] mb-4 p-4 bg-purple-600  border border-blue-200 rounded">
        <h4 className="font-semibold mb-2 text-white">Session Status:</h4>
        <div className="text-sm text-white space-y-1">
          <p> {debugInfo.isVotingActive ? "Session Actif" : "Session Not Actif"}</p>
        </div>
      </div>
      
      {error && (
        <div className="w-full max-w-[600px] mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong>
          <pre className="whitespace-pre-wrap mt-2 text-sm">{error}</pre>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-[600px]">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block font-medium mb-2">Start Time</label>
            <div className="p-2 border rounded bg-gray-200">
              {getStartTimeDisplay()}
              <span className="text-xs text-gray-500 block">(2 minutes from now)</span>
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block font-medium mb-2">End Time</label>
            <input
              type="datetime-local"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              min={getMinDateTime()}
              className="w-full p-2 border rounded"
              required
            />
            <span className="text-xs text-gray-500">Minimum 5 minutes voting duration</span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={transactionPending || !debugInfo.isOrganizer || debugInfo.activeCandidatesCount === 0}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-2 px-6 rounded mt-2 w-full sm:w-auto transition-colors"
        >
          {transactionPending ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Processing Transaction...
            </span>
          ) : (
            "Set Voting Period"
          )}
        </button>
        
        {(!debugInfo.isOrganizer || debugInfo.activeCandidatesCount === 0) && (
          <p className="text-sm text-red-400 mt-2">
            {!debugInfo.isOrganizer && "You must be the organizer to set voting periods. "}
            {debugInfo.activeCandidatesCount === 0 && "Add candidates before setting a voting period."}
          </p>
        )}
      </form>
    </div>
  );
};

export default Countdown;