// Import necessary dependencies
import React, { useState, useEffect, createContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers"; // ✅ Recommended


import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";

// Import contract details
import { VotingAddress, VotingAddressABI } from "./constants";
import { connection } from "next/server";

// Create context **only once**
export const VotingContext = createContext();

// Infura IPFS Configuration
const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;

if (!projectId || !projectSecret) {
  throw new Error("Missing INFURA credentials! Check your .env.local file.");
}

const auth = "Basic " + btoa(projectId + ":" + projectSecret);

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

// Function to get contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

// Voting Provider Component
export const VotingProvider = ({ children }) => {
  const votingTitle = "First Smart Contract Dapp";
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [error, setError] = useState("");

  // **Connect Wallet**
  const connectWallet = async () => {
     
    if (!window.ethereum) return setError("Install MetaMask first!");
    try {
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(account[0]); // Save connected account
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  // **Check if Wallet is Connected**
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Install MetaMask first!");
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      setError("Connect MetaMask and reload the page.");
    }
  };

  // **Connect to Smart Contract**
  const connectSmartContract = async () => {
     try {
       const web3Modal = new Web3Modal();
       console.log("Web3Modal instance:", web3Modal);
 
       const provider = await web3Modal.connect();
       const web3Provider = new ethers.providers.Web3Provider(provider);
       const signer = web3Provider.getSigner();
       const contract = fetchContract(signer);
 
       console.log("Smart Contract Connected:", contract);
       return contract;
     } catch (error) {
       console.error("Error connecting to smart contract:", error);
     }
   };

  // **Upload File to IPFS**
  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log("Uploaded File URL:", url);
      return url;
    } catch (error) {
      setError("Error uploading file to IPFS.");
    }
  };

  // **Automatically Connect Smart Contract When Wallet is Connected**
  useEffect(() => {
     const initialize = async () => {
       await connectWallet(); // Connect wallet on load
       if (currentAccount) {
         await connectSmartContract(); // Connect contract if wallet is connected
       } else {
         console.log("Wallet not connected. Connect wallet first.");
       }
     };
   
     initialize();
   }, [currentAccount]); 
  

  return (
    <VotingContext.Provider
      value={{
        votingTitle,
        connectWallet,
        checkIfWalletIsConnected,
        connectSmartContract,
        uploadToIPFS,
        currentAccount,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
