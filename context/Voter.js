// Import dependencies
import React, { useState, useEffect, createContext, useContext } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { VotingAddress, VotingAddressABI } from "./constants";
import { AuthContext } from "../pages/context/AuthContext"; // Import Auth Context


// Pinata API Keys
const PINATA_API_KEY = "7aa86323c46359e68595";
const PINATA_API_SECRET = "943c3d77c06632fdf5c1c7861167675be909d1d6886fc0e23492aaa507cd6f19";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZGI4MGUzZC1jZDA4LTQxYTgtODFmZS01MTllODRjZTYyODkiLCJlbWFpbCI6ImV2b3Rpbmd2b3RleEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjAzMWYzZjVhZTYzYTU2MTYyMTQiLCJzY29wZWRLZXlTZWNyZXQiOiI3N2Y5NWRiYWQzNGEzNDhmZDk3YmFhYjYzOTEyZmQwMzZmZGUyZTQyMGEzMWM5ZTRlODExZWE3ODczMGY3NTEwIiwiZXhwIjoxNzc3OTE3NDU3fQ.fMhqeXrMaQB-T-O7-_i5ILMXcM79ncck1PrYDGl5uV8";


// Remove redundant RPC configuration - keep only ARCHIVE_NODES
const ARCHIVE_NODES = {
  SEPOLIA: "https://eth-sepolia.public.blastapi.io", // Blast API (archive node)
  GOERLI: "https://ethereum-goerli.publicnode.com",  // Public Node (archive node)
  MAINNET: "https://rpc.ankr.com/eth"                // Ankr (archive node)
};


// Create a separate provider just for read operations
let readOnlyProvider = null;


// Initialize read-only provider
const getReadOnlyProvider = async () => {
  if (readOnlyProvider) return readOnlyProvider;
 
  try {
    // Use a reliable archive node directly instead of MetaMask
    readOnlyProvider = new ethers.providers.JsonRpcProvider(ARCHIVE_NODES.SEPOLIA);
    await readOnlyProvider.getNetwork(); // Test connection
    console.log("Read-only provider connected to archive node");
    return readOnlyProvider;
  } catch (error) {
    console.error("Failed to connect to archive node:", error);
    throw new Error("Cannot connect to blockchain archive node");
  }
};


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


  // First, let's improve the checkIfUserVoted function to set hasVoted state consistently:
  const checkIfUserVoted = async () => {
    try {
      setIsLoading(true);
      // Only check database - blockchain checks are unreliable
      if (user && user.id) {
        console.log("Checking if user has voted in database", user.id);
        const hasVotedDb = await checkVoted();
        if (hasVotedDb) {
          setHasVoted(true);
          return true;
        }
      }
      setHasVoted(false);
      return false;
    } catch (error) {
      console.error("Error checking if user voted:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  // Modify the vote function to properly catch and handle the wallet link error
const vote = async (candidateAddress) => {
  try {
    if (!currentAccount) throw new Error("Wallet not connected");
    if (!user || !user.id) throw new Error("You must be logged in to vote");
    
    // First verify wallet is linked to current user (like in whiteVote and multipleVote)
    const isVerified = await verifyWallet(currentAccount);
    
    // If no wallet is linked to this user, try to link the current wallet
    if (!isVerified && user && !user.walletAddress) {
      console.log("No wallet linked to user, attempting to link current wallet");
      try {
        const linkResult = await linkWallet(currentAccount);
        
        if (!linkResult.success) {
          // Instead of throwing an error, return a result object with the error
          if (linkResult.error && linkResult.error.includes("linked to another")) {
            return { 
              success: false, 
              error: "This wallet address is already linked to another account"
            };
          } else {
            return { 
              success: false, 
              error: linkResult.error || "Failed to link wallet to your account"
            };
          }
        }
        
        console.log("Wallet linked successfully");
      } catch (linkError) {
        console.error("Error linking wallet:", linkError);
        // Return error object instead of throwing
        return { 
          success: false, 
          error: linkError.message || "Error linking wallet to your account"
        };
      }
    } else if (!isVerified) {
      // Return error object instead of throwing
      return { 
        success: false, 
        error: "This wallet is not linked to your account. Please use the wallet registered with your account."
      };
    }
    
    // Database checks
    const userVotedInDb = await checkVoted();
    if (userVotedInDb) {
      throw new Error("This user account has already voted");
    }
    
    // Voting period check
    const now = Math.floor(Date.now() / 1000);
    if (now < votingPeriod.start || now > votingPeriod.end) {
      throw new Error("Voting is not currently active");
    }
    
    const contract = await connectSmartContract();
    if (!contract) throw new Error("Failed to connect to smart contract");
    
    // Send transaction
    const transaction = await contract.vote(candidateAddress, {
      gasLimit: 500000,
      gasPrice: ethers.utils.parseUnits('50', 'gwei')
    });
    
    console.log("Vote transaction sent:", transaction.hash);
    
    // Wait for transaction to be mined (like in multipleVote)
    const receipt = await transaction.wait();
    console.log("Transaction confirmed with receipt:", receipt);
    
    // Record vote in database with wallet address
    await recordVote(currentAccount);
    setHasVoted(true); // This line is important
    setMessage("Vote recorded successfully!");
    
    return transaction;
  } catch (error) {
    console.error("Vote failed:", error);
    // Convert any runtime errors to regular errors that can be displayed in UI
    throw new Error(parseErrorMessage(error));
  }
};

  const whiteVote = async () => {
    try {
      if (!currentAccount) throw new Error("Wallet not connected");
      if (!user || !user.id) throw new Error("You must be logged in to vote");
      
      // First check if the user has any wallet linked
      const isVerified = await verifyWallet(currentAccount);
      
      // If no wallet is linked to this user, try to link the current wallet
      if (!isVerified && user && !user.walletAddress) {
        console.log("No wallet linked to user, attempting to link current wallet");
        try {
          const linkResult = await linkWallet(currentAccount);
          
          if (!linkResult.success) {
            // Instead of throwing an error, return a result object with the error
            if (linkResult.error && linkResult.error.includes("linked to another")) {
              return { 
                success: false, 
                error: "This wallet address is already linked to another account"
              };
            } else {
              return { 
                success: false, 
                error: linkResult.error || "Failed to link wallet to your account"
              };
            }
          }
          
          console.log("Wallet linked successfully");
        } catch (linkError) {
          console.error("Error linking wallet:", linkError);
          // Return error object instead of throwing
          return { 
            success: false, 
            error: linkError.message || "Error linking wallet to your account"
          };
        }
      } else if (!isVerified) {
        // Return error object instead of throwing
        return { 
          success: false, 
          error: "This wallet is not linked to your account. Please use the wallet registered with your account."
        };
      }
      
      // Database checks
      const userVotedInDb = await checkVoted();
      if (userVotedInDb) {
        return {
          success: false,
          error: "This user account has already voted"
        };
      }
      
      // Voting period check
      const now = Math.floor(Date.now() / 1000);
      if (now < votingPeriod.start || now > votingPeriod.end) {
        return {
          success: false,
          error: "Voting is not currently active"
        };
      }
      
      const contract = await connectSmartContract();
      if (!contract) {
        return {
          success: false,
          error: "Failed to connect to smart contract"
        };
      }
      
      // Send white vote transaction
      const transaction = await contract.whiteVote({
        gasLimit: 500000,
        gasPrice: ethers.utils.parseUnits('50', 'gwei')
      });
      
      console.log("White vote transaction sent:", transaction.hash);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      console.log("Transaction confirmed with receipt:", receipt);
      
      // Record vote in database with wallet address
      await recordVote(currentAccount);
      setHasVoted(true);
      setMessage("White vote recorded successfully!");
      
      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error("White vote failed:", error);
      // Return error object instead of throwing
      return {
        success: false,
        error: parseErrorMessage(error)
      };
    }
  };


  const multipleVote = async (candidateAddresses) => {
    try {
      if (!currentAccount) throw new Error("Wallet not connected");
      if (!user || !user.id) throw new Error("You must be logged in to vote");

      // First check if the user has any wallet linked
      const isVerified = await verifyWallet(currentAccount);
      
      // If no wallet is linked to this user, try to link the current wallet
      if (!isVerified && user && !user.walletAddress) {
        console.log("No wallet linked to user, attempting to link current wallet");
        try {
          const linkResult = await linkWallet(currentAccount);
          
          if (!linkResult.success) {
            // Instead of throwing an error, return a result object with the error
            if (linkResult.error && linkResult.error.includes("linked to another")) {
              return { 
                success: false, 
                error: "This wallet address is already linked to another account"
              };
            } else {
              return { 
                success: false, 
                error: linkResult.error || "Failed to link wallet to your account"
              };
            }
          }
          
          console.log("Wallet linked successfully");
        } catch (linkError) {
          console.error("Error linking wallet:", linkError);
          // Return error object instead of throwing
          return { 
            success: false, 
            error: linkError.message || "Error linking wallet to your account"
          };
        }
      } else if (!isVerified) {
        // Return error object instead of throwing
        return { 
          success: false, 
          error: "This wallet is not linked to your account. Please use the wallet registered with your account."
        };
      }
      
      if (!Array.isArray(candidateAddresses) || candidateAddresses.length < 2) {
        return {
          success: false,
          error: "Multiple voting requires at least 2 candidates"
        };
      }

      // Database check
      const userVotedInDb = await checkVoted();
      if (userVotedInDb) {
        return {
          success: false,
          error: "This user account has already voted"
        };
      }

      // Voting period check
      const now = Math.floor(Date.now() / 1000);
      if (now < votingPeriod.start || now > votingPeriod.end) {
        return {
          success: false,
          error: "Voting is not currently active"
        };
      }

      const contract = await connectSmartContract();
      if (!contract) {
        return {
          success: false,
          error: "Failed to connect to smart contract"
        };
      }

      // Send multiple vote transaction
      const transaction = await contract.multipleVote(candidateAddresses, {
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('50', 'gwei')
      });

      console.log("Multiple vote transaction sent:", transaction.hash);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      console.log("Transaction confirmed with receipt:", receipt);
      
      // Record vote in the database
      await recordVote(currentAccount);
      
      // Update UI state
      setHasVoted(true);
      setMessage("Multiple votes recorded successfully!");

      return {
        success: true,
        transaction: transaction
      };
    } catch (error) {
      console.error("Multiple vote failed:", error);
      // Return error object instead of throwing
      return {
        success: false,
        error: parseErrorMessage(error)
      };
    }
  };


  // Add a dedicated function to update the UI after any vote
  const markUserAsVoted = () => {
    setHasVoted(true);
  };


  // Use this in useEffect to run on mount and when account changes
  useEffect(() => {
    const init = async () => {
      // Only check if user has already voted, don't automatically connect wallet
      if (currentAccount) {
        await checkIfUserVoted();
      }
     
      // Always fetch from blockchain directly
      await getVotingPeriod();
    };
   
    init();
  }, [currentAccount, user]); // Run when account or user changes


  // Make sure fetchContract works properly
  const fetchContract = (signerOrProvider) => {
    try {
      // Log contract address and ABI for debugging
      console.log("Contract address:", VotingAddress);
      console.log("Using signer or provider:", signerOrProvider);
     
      return new ethers.Contract(
        VotingAddress,
        VotingAddressABI,
        signerOrProvider
      );
    } catch (error) {
      console.error("Error creating contract instance:", error);
      return null;
    }
  };


  // REPLACE with this simplified version
  const connectSmartContract = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return fetchContract(signer);
      } else {
        console.log("MetaMask not found, using direct RPC connection");
        const provider = new ethers.providers.JsonRpcProvider(ARCHIVE_NODES.SEPOLIA);
        return fetchContract(provider);
      }
    } catch (error) {
      console.error("Error connecting to smart contract:", error);
      setErrMessage(`Failed to connect to blockchain: ${error.message}`);
      return null;
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
 


  // Replace getCurrentSessionCandidates with this fixed version
  const getCurrentSessionCandidates = async () => {
    try {
      console.log("Starting to fetch candidates...");
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed");
     
      // First try to get active candidates
      const activeAddresses = await contract.getActiveCandidates();
      console.log("Active candidate addresses:", activeAddresses);
     
      if (activeAddresses && activeAddresses.length > 0) {
        console.log(`Found ${activeAddresses.length} active candidates`);
        return activeAddresses;
      }
     
      // If no active candidates found, try getting from current session
      console.log("No active candidates, trying current session...");
      const addresses = await contract.getCurrentSessionCandidates();
      console.log("Current session candidates:", addresses);
     
      if (addresses && addresses.length > 0) {
        console.log(`Found ${addresses.length} candidates in current session`);
        return addresses;
      }
     
      // If still no candidates, check if there's a session and try to get candidates from there
      const currentSessionId = await contract.currentSessionId();
      if (currentSessionId.toString() !== "0") {
        console.log("Current session ID:", currentSessionId.toString());
       
        // Get the session directly
        const sessionData = await contract.getSession(currentSessionId);
        console.log("Session data:", sessionData);
       
        // Check if there are candidates in the session
        if (sessionData && sessionData[4] && sessionData[4].length > 0) {
          const sessionCandidates = sessionData[4];
          console.log("Found candidates in session data:", sessionCandidates);
         
          // Filter out archived candidates manually
          const filteredCandidates = [];
          for (let i = 0; i < sessionCandidates.length; i++) {
            const candData = await contract.getCandidateData(sessionCandidates[i]);
            // Check isArchived flag (index 9 in the return data)
            if (!candData[9]) {
              filteredCandidates.push(sessionCandidates[i]);
            }
          }
         
          console.log("After filtering archived candidates:", filteredCandidates);
          return filteredCandidates;
        }
      }
     
      console.log("No candidates found in any source");
      return [];
    } catch (error) {
      console.error("Error fetching session candidates:", error);
      return [];
    }
  };
 
  //GetCandDet
  const getCandidateDetails = async (candidateAddress) => {
    try {
      const contract = await connectSmartContract();
      if (!contract) throw new Error("Smart contract connection failed!");


      const data = await contract.getCandidateData(candidateAddress);
      console.log("Raw candidate data:", data);


      return {
        age: data[0],
        name: data[1],
        candidateId: data[2].toString(),
        imageUrl: `https://gateway.pinata.cloud/ipfs/${data[6]}`,
        party: data[4],
        voteCount: data[5].toString(),
        address: data[7],
        sessionId: data[8].toString(),
        isArchived: data[9]  // Add the isArchived flag
      };
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      return null;
    }
  };
 
  //session swala7
  const parseErrorMessage = (error) => {
    if (error?.data?.message) return error.data.message;
    if (error?.error?.message) return error.error.message;
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


// Replace the getVotingPeriod function with this improved version
const getVotingPeriod = async () => {
  try {
    setIsLoading(true);


    // Connect to the smart contract
    const contract = await connectSmartContract();
    if (!contract) throw new Error("Failed to connect to smart contract");


    // Fetch the current session ID
    const currentSessionId = await contract.currentSessionId();
    if (currentSessionId.toNumber() === 0) {
      console.log("No active session found");
      return { start: 0, end: 0, isActive: false };
    }


    // Fetch the session details
    const session = await contract.getSession(currentSessionId);
   
    // Get contract's voting state
    const isActiveInContract = await contract.isVotingActive();


    // Extract start and end times
    const start = session.startPeriod.toNumber();
    const end = session.endPeriod.toNumber();


    // Get current blockchain time (may be slightly different from local time)
    const latestBlock = await contract.provider.getBlock("latest");
    const blockchainTime = latestBlock.timestamp;


    console.log("Fetched voting period from contract:", {
      sessionId: currentSessionId.toString(),
      start: start,
      startFormatted: new Date(start * 1000).toLocaleString(),
      end: end,
      endFormatted: new Date(end * 1000).toLocaleString(),
      blockchainTime: blockchainTime,
      blockchainTimeFormatted: new Date(blockchainTime * 1000).toLocaleString(),
      localTime: Math.floor(Date.now() / 1000),
      localTimeFormatted: new Date().toLocaleString(),
      isActiveInContract: isActiveInContract
    });


    // Update the state with the fetched voting period
    const votingPeriod = {
      start,
      end,
      isActive: isActiveInContract,
      currentBlockchainTime: blockchainTime
    };
   
    setVotingPeriodState(votingPeriod);
    return votingPeriod;
  } catch (error) {
    console.error("Error getting voting period from contract:", error);
    return { start: 0, end: 0, isActive: false };
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
 
      // Log addresses for debugging
      const organizer = await contract.votingOrganizer();
      console.log("Organizer Address:", organizer);
      console.log("Your Wallet Address:", currentAccount);
 
      // Make sure current user is the organizer
      if (organizer.toLowerCase() !== currentAccount.toLowerCase()) {
        throw new Error("Only the voting organizer can create candidates");
      }
 
      // Check if we are in the voting period
      const votingPeriod = await getVotingPeriod();
      console.log("CURRENT VOTING PERIOD:", votingPeriod);
     
      // Get current timestamp in seconds (same method used in Countdown.jsx)
      const now = Math.floor(Date.now() / 1000);
      console.log("Current time:", now);
      console.log("Current UTC time:", new Date(now * 1000).toUTCString());
     
      // Check if current time is within voting period using the same logic as Countdown
      if (votingPeriod?.start && votingPeriod?.end) {
        // If we're inside the voting period, don't allow creating candidates
        if (now >= votingPeriod.start && now <= votingPeriod.end) {
          setErrMessage("Cannot create candidates during active voting period");
          return false;
        }
      }
 
      // Generate a unique address for the candidate
      const candidateAddress = ethers.utils.getAddress(
        ethers.utils.hexlify(
          ethers.utils.randomBytes(20)
        )
      );
 
      console.log("Using candidate address:", candidateAddress);
 
      // Use specific transaction parameters
      const tx = await contract.setCandidate(
        candidateAddress, // Use a generated address instead of currentAccount
        age,
        name,
        imageUrl,
        party,
        ipfsHash,
        {
          gasLimit: 1000000, // Increase gas limit
          gasPrice: ethers.utils.parseUnits('50', 'gwei') // Set specific gas price
        }
      );
 
      console.log("Transaction sent:", tx.hash);
 
      // Wait for transaction with more detailed error handling
      try {
        const receipt = await tx.wait(2); // Wait for 2 confirmations
        console.log("Transaction confirmed:", receipt);
      } catch (waitError) {
        console.error("Transaction failed:", waitError);
        throw new Error("Transaction was sent but failed to be confirmed");
      }
 
      setMessage("Candidate created successfully!");
      console.log("Candidate created:", { age, name, imageUrl, party });
 
      return true;
    } catch (error) {
      // Better error parsing
      let errorMessage = "Failed to create candidate";
     
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
     
      console.error("Create candidate error:", error);
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
        getCurrentSessionCandidates,
        createCandidate,
        getCandidateDetails,
        vote,
        whiteVote,
        multipleVote,
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

