import React, { useState, useEffect, useContext } from "react";
import { VotingContext } from '@/context/Voter';

const Countdown = ({ checkWalletVerification }) => {
  const [eventStartDate, setEventStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [eventEndDate, setEventEndDate] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [votingAlreadySet, setVotingAlreadySet] = useState(false);
  const [loadingVotingPeriod, setLoadingVotingPeriod] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [error, setError] = useState("");

  const { 
    votingPeriod, 
    setVotingPeriod, 
    getVotingPeriod,
    currentAccount,
    isLoading,
    connectSmartContract
  } = useContext(VotingContext);

  const formatDate = (dateStr) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 justify-center items-center py-6 max-w-[900px] mx-auto">
        {[{ label: "days", value: days },
          { label: "hours", value: hours },
          { label: "minutes", value: minutes },
          { label: "seconds", value: seconds }]
          .map(({ label, value }) => (
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

  useEffect(() => {
    const loadVotingPeriod = async () => {
      setLoadingVotingPeriod(true);
      setError("");
      try {
        const periodData = await getVotingPeriod();
        console.log("Blockchain voting period:", periodData);

        if (periodData?.start && periodData?.end) {
          setEventStartDate(new Date(periodData.start * 1000).toISOString().slice(0, 16));
          setEventEndDate(new Date(periodData.end * 1000).toISOString().slice(0, 16));
          setVotingAlreadySet(true);
          setCountdownStarted(true);
        }
      } catch (error) {
        console.error("Failed to load voting period:", error);
        setError("Failed to load voting period from blockchain");
      } finally {
        setLoadingVotingPeriod(false);
      }
    };

    loadVotingPeriod();
  }, []);

  useEffect(() => {


    
    if (!countdownStarted || !eventEndDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(eventEndDate).getTime();
      const remaining = end - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownStarted, eventEndDate]);

  const handleReset = () => {
    setEventEndDate("");
    setTimeRemaining(0);
    setCountdownStarted(false);
    setVotingAlreadySet(false);
    setEventStartDate(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError("");

    // Verify admin wallet first
    const isVerified = await checkWalletVerification();
    if (!isVerified) return;

    if (!eventEndDate) {
      setError("Please set an end date");
      return;
    }

    try {
      setTransactionPending(true);
      const startTimestamp = Math.floor(new Date(eventStartDate).getTime() / 1000);   
      const endTimestamp = Math.floor(new Date(eventEndDate).getTime() / 1000);

      // Get contract instance from VotingContext
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Failed to connect to smart contract");

      // Send transaction and wait for confirmation
      const tx = await contract.setVotingPeriod(startTimestamp, endTimestamp);
      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Get updated period from blockchain
      const updatedPeriod = await getVotingPeriod();
      console.log("Updated voting period:", updatedPeriod);

      if (updatedPeriod?.start && updatedPeriod?.end) {
        setVotingAlreadySet(true);
        setCountdownStarted(true);
        setEventStartDate(new Date(updatedPeriod.start * 1000).toISOString().slice(0, 16));
        setEventEndDate(new Date(updatedPeriod.end * 1000).toISOString().slice(0, 16));
      } else {
        throw new Error("Failed to fetch updated voting period");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error.message || "Failed to set voting period");
      setCountdownStarted(false);
      setVotingAlreadySet(false);
    } finally {
      setTransactionPending(false);
    }
  };

  if (loadingVotingPeriod) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-lg text-gray-600 font-medium">Loading voting period...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      {error && (
        <div className="w-full max-w-[600px] mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {transactionPending && (
        <div className="w-full max-w-[600px] mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700 mr-2"></div>
          Transaction pending... Please wait for confirmation
        </div>
      )}

      <h2
        className="text-black text-[clamp(1.5rem,5vw,2rem)] mb-4 text-center"
      >
        Countdown to Voting end
      </h2>

      {countdownStarted && eventEndDate && (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="bg-white shadow-md rounded-xl px-6 py-4 min-w-[300px] text-center hover:scale-105 transition-transform duration-200 ease-in-out">
            <h3 className="text-[#8b32c7] font-semibold mb-2 text-lg">From:</h3>
            <p className="text-gray-800 text-lg">{formatDate(eventStartDate)}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl px-6 py-4 min-w-[300px] text-center hover:scale-105 transition-transform duration-200 ease-in-out">
            <h3 className="text-[#8b32c7] font-semibold mb-2 text-lg">To:</h3>
            <p className="text-gray-800 text-lg">{formatDate(eventEndDate)}</p>
          </div>
        </div>
      )}

      {formatTime(timeRemaining)}

      {!votingAlreadySet && !countdownStarted && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#f6f6f6] flex flex-col justify-center p-6 w-full max-w-[600px] rounded-xl shadow-md mt-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 mb-4">
            <div className="flex-1">
              <label htmlFor="start-date" className="mb-2 font-medium block">
                Voting Start
              </label>
              <input
                name="start-date"
                type="datetime-local"
                value={eventStartDate}
                disabled
                className="p-2 border rounded bg-gray-200 cursor-not-allowed w-full"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="end-date" className="mb-2 font-medium block">
                Voting End
              </label>
              <input
                name="end-date"
                type="datetime-local"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="p-2 border rounded w-full"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#B342FF] text-white px-4 py-2 rounded hover:scale-105 transition-transform w-full sm:w-auto self-center cool-button"
          >
            Start Countdown
          </button>
        </form>
      )}

      {/* {countdownStarted && (
        <div className="mt-10 sm:mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={handleReset}
            className="cool-button bg-[#3A2663] rounded-2xl px-8 py-6 min-w-[200px] text-[clamp(1rem,2.5vw,1.25rem)] font-semibold text-white shadow-md hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            Reset
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Countdown;
