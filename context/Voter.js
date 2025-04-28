// Import dependencies
import React, { useState, useEffect, createContext, useContext } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { VotingAddress, VotingAddressABI } from "./constants";
import { AuthContext } from "../pages/context/AuthContext"; // Import Auth Context

// Pinata API Keys
const PINATA_API_KEY = "7aa86323c46359e68595";
const PINATA_API_SECRET = "943c3d77c06632fdf5c1c7861167675be909d1d6886fc0e23492aaa507cd6f19";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZGI4MGUzZC1jZDA4LTQxYTgtODFmZS01MTllODRjZTYyODkiLCJlbWFpbCI6ImV2b3Rpbmd2b3RleEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiN2FhODYzMjNjNDYzNTllNjg1OTUiLCJzY29wZWRLZXlTZWNyZXQiOiI5NDNjM2Q3N2MwNjYzMmZkZjVjMWM3ODYxMTY3Njc1YmU5MDlkMWQ2ODg2ZmMwZTIzNDkyYWFhNTA3Y2Q2ZjE5IiwiZXhwIjoxNzc0MjczNTYxfQ.L9y_1FS8MGo0YvQ9FAywuX3FXHScpZuyvUNNfBq90pI";

// Create Voting Context
export const VotingContext = createContext();

// Voting Provider Component
export const VotingProvider = ({ children }) => {
  // Access Auth Context
  const { user, linkWallet, verifyWallet, checkVoted, recordVote } = useContext(AuthContext);
  
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [message, setMessage] = useState("");
  const [votingPeriod, setVotingPeriodState] = useState({
    start: null,
    end: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletLinked, setWalletLinked] = useState(false);
  const randomWallet = ethers.Wallet.createRandom();
  const newCandidateAddress = randomWallet.address;

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      // Handler for account changes
      const handleAccountsChanged = async (accounts) => {
        console.log("MetaMask accounts changed:", accounts);
        if (accounts.length > 0 && accounts[0] !== currentAccount) {
          setCurrentAccount(accounts[0]);
          
          // Reset wallet link status
          setWalletLinked(false);
          
          // Check if the new account is linked to the current user
          if (user && user.id) {
            try {
              const isVerified = await verifyWallet(accounts[0]);
              if (isVerified) {
                console.log("New account is linked to current user");
                setWalletLinked(true);
              }
            } catch (error) {
              console.error("Error verifying new account:", error);
            }
          }
          
          // Check if the new account has already voted
          await checkIfUserVoted();
        } else if (accounts.length === 0) {
          setCurrentAccount("");
          setWalletLinked(false);
          console.log("Disconnected from MetaMask");
        }
      };

      // Subscribe to account change events
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      
      // Get initial accounts
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch(err => console.error("Error requesting accounts:", err));
      
      // Cleanup function to remove event listener
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [user]); // Only depend on user changes, not currentAccount

  // Connect Wallet without automatic linking
  const connectWallet = async () => {
    console.log("Trying to connect to MetaMask...");
    if (!window.ethereum) {
      setError("Install MetaMask first!");
      return false;
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAddress = accounts[0];
      
      // Only update if account actually changed
      if (connectedAddress !== currentAccount) {
        setCurrentAccount(connectedAddress);
        console.log("Wallet connected:", connectedAddress);
        
        // Reset wallet linked status
        setWalletLinked(false);
        
        // Check if this wallet is linked to current user
        if (user && user.id) {
          try {
            const isVerified = await verifyWallet(connectedAddress);
            if (isVerified) {
              console.log("Wallet linked to user account");
              setWalletLinked(true);
            }
          } catch (error) {
            console.error("Error verifying wallet:", error);
          }
        }
        
        // Check voting status of new account
        await checkIfUserVoted();
      }
      
      return true;
    } catch (err) {
      console.error("Error connecting wallet:", err);
      return false;
    }
  };

  // Enhanced checkIfUserVoted function
  const checkIfUserVoted = async () => {
    try {
      setIsLoading(true);
      
      // First check if the user has voted in the database (by user ID)
      if (user && user.id) {
        console.log("Checking if user has voted in database", user.id);
        const hasVotedDb = await checkVoted();
        if (hasVotedDb) {
          console.log("User has already voted (database record found)");
          setHasVoted(true);
          return true;
        }
      } else {
        console.log("No user logged in, cannot check voting status in database");
      }
      
      // Then check if the current wallet has voted on the blockchain
      if (currentAccount) {
        console.log("Checking if wallet has voted on blockchain:", currentAccount);
        const contract = await connectSmartContract();
        const hasVotedChain = await contract.hasVoted(currentAccount);
        
        if (hasVotedChain) {
          console.log("Wallet has already voted on blockchain");
          // If blockchain shows vote but not database, update database
          if (user && user.id) await recordVote();
          setHasVoted(true);
          return true;
        }
      } else {
        console.log("No wallet connected, cannot check voting status on blockchain");
      }
      
      // If we got this far, user hasn't voted yet
      console.log("User/wallet has not voted yet");
      setHasVoted(false);
      return false;
    } catch (error) {
      console.error("Error checking if user voted:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced vote function to block any wallet that has voted with any account
  const vote = async (candidateAddress) => {
    try {
      if (!currentAccount) throw new Error("Wallet not connected");
      if (!user || !user.id) throw new Error("You must be logged in to vote");
      
      // STRICT WALLET CHECK: Check blockchain first - any wallet that has voted is blocked
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Failed to connect to smart contract");
      
      const walletHasVoted = await contract.hasVoted(currentAccount);
      if (walletHasVoted) {
        throw new Error("This wallet has already been used to vote");
      }
      
      // USER CHECK: Then check if this user has voted (in database)
      const userVotedInDb = await checkVoted();
      if (userVotedInDb) {
        throw new Error("This user account has already voted");
      }
      
      // Check if voting period is active
      const canVote = await checkVotingPeriod();
      if (!canVote) {
        throw new Error("Voting is not currently active");
      }

      // Global check for this wallet across all users in database
      try {
        const walletUsedResponse = await axios.get(
          'http://localhost:5000/api/voter/check-wallet-used',
          { 
            params: { walletAddress: currentAccount },
            withCredentials: true 
          }
        );
        
        if (walletUsedResponse.data.isUsed) {
          throw new Error("This wallet address has been used to vote by another user");
        }
      } catch (error) {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw error;
      }

      // All checks passed - proceed with vote
      const transaction = await contract.vote(candidateAddress);
      console.log("Vote transaction sent:", transaction.hash);
      
      // Record vote in database with wallet address
      await recordVoteWithWallet(currentAccount);
      
      return transaction;
    } catch (error) {
      console.error("Vote failed:", error);
      throw error;
    }
  };

  // Add this function to record vote with wallet address
  const recordVoteWithWallet = async (walletAddress) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/voter/record-vote',
        { walletAddress: walletAddress },
        { withCredentials: true }
      );
      
      return response.data.success;
    } catch (error) {
      console.error("Error recording vote with wallet:", error);
      throw error;
    }
  };

  // Use this in useEffect to run on mount and when account changes
  useEffect(() => {
    const init = async () => {
      // Only check if user has already voted, don't automatically connect wallet
      if (currentAccount) {
        await checkIfUserVoted();
      }
      
      // Load voting period from localStorage first for faster display
      const cachedPeriod = localStorage.getItem('votingPeriod');
      if (cachedPeriod) {
        setVotingPeriodState(JSON.parse(cachedPeriod));
      }
      
      // Then fetch from blockchain to ensure it's up-to-date
      await getVotingPeriod();
    };
    
    init();
  }, [currentAccount, user]); // Run when account or user changes

  // Existing fetchContract, connectSmartContract, etc. functions...
  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);


  // Connect to Smart Contract
  const connectSmartContract = async () => {
    try {
      const web3Modal = new Web3Modal();
      const provider = new ethers.providers.Web3Provider(await web3Modal.connect());
      const signer = provider.getSigner();
      return fetchContract(signer);
    } catch (error) {
      console.error("Error connecting to smart contract:", error);
    }
  };

  // Upload File to Pinata (IPFS)
  const uploadToPinata = async (file) => {
    console.log(" Uploading file to Pinata...");
  
    const formData = new FormData();
    formData.append("file", file);
  
    // Optional Metadata
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name, 
      })
    );
  
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );
  
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${PINATA_JWT}`, 
        },
      });
      console.log(" File uploaded successfully!", res.data);
      return res.data.IpfsHash;
    } catch (error) {
      console.error(" Error uploading to Pinata:", error.response?.data || error.message);
      throw new Error("IPFS upload failed");
    }
  };
  

  //Get ALL Candidates
  const getAllCandidates = async () => {
    try {
      const contract = await connectSmartContract();
      const candidates = await contract.getAllCandidates();
      console.log(" All Candidates:", candidates);
      setCandidates(candidates);
      return candidates;
    } catch (error) {
      console.error(" Error fetching all candidates:", error);
    }
  };
 
  //GetCandDet
  const getCandidateDetails = async (candidateAddress) => {
    try {
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed!");
  
      const data = await contract.getCandidateData(candidateAddress);
  
      return {
        age: data[0],
        name: data[1],
        candidateId: data[2].toString(),
        imageUrl: `https://gateway.pinata.cloud/ipfs/${data[6]}`,
        party: data[4],
        voteCount: data[5].toString(),
        address: data[7],
      };
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      return null;
    }
  };
  
  //session swala7
  const parseErrorMessage = (error) => {
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return "An unknown error occurred.";
  };

  const setVotingPeriod = async (startTime, endTime) => {
    try {
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed!");
      
      const tx = await contract.setVotingPeriod(startTime, endTime);
      await tx.wait();
      
      setMessage("Voting period set successfully!");
      console.log(`Voting period set from ${startTime} to ${endTime}`);
      
      return true;
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.log(errorMessage);
      setErrMessage(errorMessage);
      return false;
    }
  };

  // Get voting period from contract
  const getVotingPeriod = async () => {
    try {
      setIsLoading(true);
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed!");
      
      const start = await contract.start_period();
      const end = await contract.end_period();
      
      setVotingPeriodState({
        start: start.toNumber(),
        end: end.toNumber()
      });
      
      // Optionally save to localStorage
      localStorage.setItem('votingPeriod', JSON.stringify({
        start: start.toNumber(),
        end: end.toNumber()
      }));
      
      return { start: start.toNumber(), end: end.toNumber() };
    } catch (error) {
      console.error("Error getting voting period:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const checkVotingPeriod = async () => {
    try {

      // Get voting period from blockchain
      const votingPeriod = await getVotingPeriod();
      if (!votingPeriod) throw new Error("Could not fetch voting period");

      
      const now = Math.floor(Date.now() / 1000);

      // Check if current time is within voting period
      const isVotingActive = now >= votingPeriod.start && now <= votingPeriod.end;
      console.log("Voting period status:", {
        start: new Date(votingPeriod.start * 1000),
        end: new Date(votingPeriod.end * 1000),
        now: new Date(now * 1000),
        isActive: isVotingActive
      });

      return isVotingActive;
    } catch (error) {
      console.error("Failed to check voting period:", error);
      throw new Error("Could not verify voting period");
    }
  };

  const createCandidate = async (age, name, imageUrl, party, ipfsHash) => {
    try {
      console.log("Creating candidate...");
  
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed!");
      const existingCandidate = await contract.getCandidateData(currentAccount);
      console.log("Existing candidate:", existingCandidate);
      
      const organizer = await contract.votingOrganizer();
      console.log("Organizer Address in Contract:", organizer);
      console.log("Your Wallet Address:", currentAccount);
      
      const tx = await contract.setCandidate(
        newCandidateAddress, 
        age,
        name,
        imageUrl, 
        party,
        ipfsHash
      );
      
      console.log("Transaction sent:", tx.hash);

      await tx.wait(); 
  
      setMessage("Candidate created successfully!");
      console.log(" Candidate created:", { age, name, imageUrl, party });
  
      return true;
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.log(errorMessage);
      setErrMessage(errorMessage);
      return false;
    }
  };

  return (
    <VotingContext.Provider
      value={{
        connectWallet,
        connectSmartContract,
        uploadToPinata,
        currentAccount,
        getAllCandidates,
        createCandidate,
        getCandidateDetails,
        vote,
        checkIfUserVoted,
        candidates,
        message, 
        errMessage,
        setMessage,
        setErrMessage,
        setVotingPeriod,
        getVotingPeriod, 
        checkVotingPeriod,
        votingPeriod,  
        isLoading,    
        hasVoted, 
        setHasVoted,
        walletLinked
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
