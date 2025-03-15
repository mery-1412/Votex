// Import necessary dependencies
import React, { useState, useEffect, createContext } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import * as Client from "@web3-storage/w3up-client";
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory";
import * as Proof from "@web3-storage/w3up-client/proof";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";
import { VotingAddress, VotingAddressABI } from "./constants";
import { create } from '@web3-storage/w3up-client';
import * as UcantoClient from '@ucanto/client'
import { HTTP } from '@ucanto/transport'
import * as CAR from '@ucanto/transport/car'
//import { filesFromPaths } from 'files-from-path'


  
// Create Voting Context
export const VotingContext = createContext();

// Voting Provider Component
export const VotingProvider = ({ children }) => {
  const votingTitle = "First Smart Contract Dapp";
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState("");
  const [error, setError] = useState("");
  const [client, setClient] = useState(null); // ✅ Web3.Storage client state

  // **Connect Wallet**
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Install MetaMask first!");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]); // Save connected account
      console.log("✅ Wallet connected:", accounts[0]);
    } catch (err) {
      console.error("❌ Error connecting wallet:", err);
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

  // **Fetch Smart Contract**
  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

  // **Connect to Smart Contract**
  const connectSmartContract = async () => {
    try {
      const web3Modal = new Web3Modal();
      const provider = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const contract = fetchContract(signer);
      console.log("✅ Smart Contract Connected:", contract);
      return contract;
    } catch (error) {
      console.error("❌ Error connecting to smart contract:", error);
    }
  };

  // **Initialize Web3.Storage Client**
  useEffect(() => {
    const setupClient = async () => {
      console.log("🚀 setupClient is being called..."); 
      try {
        console.log("Initializing Web3.Storage client...");
        const client = await create();
        
        console.log("Logging in...");
        const account = await client.login('akilachiali@gmail.com');
        console.log("Logged in successfully:", account);
  
        console.log("Setting up Storacha Freeway Gateway...");
        const id = await client.did(); 
        console.log("ID IS " , id);
        const storachaGateway = UcantoClient.connect({
          id: id,
          codec: CAR.outbound,
          channel: HTTP.open({ url: new URL('https://w3s.link') }),
        });
        console.log("✅ Storacha Freeway Gateway connected:", storachaGateway);
        console.log("Creating space...");

        const space = await client.createSpace("VotexFinal", { 
          account,
          authorizeGatewayServices: [storachaGateway],
        });
        console.log("Space created successfully:", space);
      } catch (error) {
        console.error("Error during setup:", error);
      }
    }

    setupClient();
  }, []);

 
  ///upload file heeeeeeeeeeeeerrrrrrrrrrrrrrreeeeeeeeeee
  useEffect(() => {
    console.log("🟢 useEffect triggered...");
    const uploadFiles = async () => {

      console.log("✅ calling upload file")
      try{

        const files = [
          new File(["some-file-content"], "./testfile.txt"),
          
        ];

        const directoryCid = await client.uploadDirectory(files);
        console.log("✅ Directory uploaded successfully! CID:", directoryCid);
        console.log("🔗 View on IPFS:", `https://w3s.link/ipfs/${directoryCid}`);
      }
      catch (error) {
        console.error("❌ Error uploading directory:", error);
      }
       
    };
  
    uploadFiles();
  }, []);

  
   
  

  // **Upload File to IPFS via Web3.Storage**
  const uploadToIPFS = async (file) => {
    if (!client) {
      console.error("⚠️ Web3.Storage client is not initialized.");
      return null;
    }
    try {
      console.log("📤 Uploading file to IPFS...");
      const cid = await client.upload(file); // Upload the file
      const url = `https://w3s.link/ipfs/${cid}`;
      console.log("✅ Uploaded File URL:", url);
      return url;
    } catch (error) {
      console.error("❌ Error uploading file to IPFS:", error);
    }
  };

  // **Auto-connect on Page Load**
  useEffect(() => {
    const initialize = async () => {
      await connectWallet(); // Connect wallet on load
      if (currentAccount) {
        await connectSmartContract(); // Connect contract if wallet is connected
      } else {
        console.log("⚠️ Wallet not connected. Connect wallet first.");
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
        //uploadToIPFS,
        currentAccount,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
