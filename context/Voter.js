// Import dependencies
import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import axios from "axios";
import { VotingAddress, VotingAddressABI } from "./constants";

// Pinata API Keys
const PINATA_API_KEY = "c505c30abff8a1ba8ccf";
const PINATA_API_SECRET = "1fd98c5927f9824ab08d2b2241c9e04f4c0040be89ffd2b5bb5fec28c232aa70";

// Create Voting Context
export const VotingContext = createContext();

// Voting Provider Component
export const VotingProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [error, setError] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Install MetaMask first!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      console.log("✅ Wallet connected:", accounts[0]);
    } catch (err) {
      console.error("❌ Error connecting wallet:", err);
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
      console.error("❌ Error connecting to smart contract:", error);
    }
  };

  // Upload File to Pinata (IPFS)
  const uploadToPinata = async (file) => {
    console.log("📤 Uploading file to Pinata...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": PINATA_API_KEY,
          "pinata_secret_api_key": PINATA_API_SECRET,
        },
      });
      console.log("✅ File uploaded successfully!", res.data);
      return res.data.IpfsHash;
    } catch (error) {
      console.error("❌ Error uploading to Pinata:", error);
    }
  };


  //get all canddat

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
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
