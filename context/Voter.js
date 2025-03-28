// Import dependencies
import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { VotingAddress, VotingAddressABI } from "./constants";

// Pinata API Keys
const PINATA_API_KEY = "7aa86323c46359e68595";
const PINATA_API_SECRET = "943c3d77c06632fdf5c1c7861167675be909d1d6886fc0e23492aaa507cd6f19";
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzZGI4MGUzZC1jZDA4LTQxYTgtODFmZS01MTllODRjZTYyODkiLCJlbWFpbCI6ImV2b3Rpbmd2b3RleEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiN2FhODYzMjNjNDYzNTllNjg1OTUiLCJzY29wZWRLZXlTZWNyZXQiOiI5NDNjM2Q3N2MwNjYzMmZkZjVjMWM3ODYxMTY3Njc1YmU5MDlkMWQ2ODg2ZmMwZTIzNDkyYWFhNTA3Y2Q2ZjE5IiwiZXhwIjoxNzc0MjczNTYxfQ.L9y_1FS8MGo0YvQ9FAywuX3FXHScpZuyvUNNfBq90pI";

// Create Voting Context
export const VotingContext = createContext();

// Voting Provider Component
export const VotingProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const randomWallet = ethers.Wallet.createRandom();const newCandidateAddress = randomWallet.address;

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Install MetaMask first!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      console.log("Wallet connected:", accounts[0]);
    } catch (err) {
      console.error(" Error connecting wallet:", err);
    }
  };

  // Fetch Smart Contract
  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

  // Connect to Smart Contract
  const connectSmartContract = async () => {
    try {
      const web3Modal = new Web3Modal();
      const provider = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      return fetchContract(signer);
    } catch (error) {
      console.error(" Error connecting to smart contract:", error);
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
  
      alert(" Candidate created successfully!");
      console.log(" Candidate created:", { age, name, imageUrl, party });
  
      return true;
    } catch (error) {
      console.error(" Error creating candidate:", error.message || error);
      alert(" Failed to create candidate. See console for details.");
      return false;
    }
  };
  
  

  useEffect(() => {
    connectWallet();
  }, []);

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
        candidates,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
