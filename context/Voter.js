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
import { create } from '@web3-storage/w3up-client'
import { filesFromPaths } from 'files-from-path'

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
      const client = await create()
      await client.login('akilachiali@gmail.com')
      await client.setCurrentSpace("did:key:z6MkvpkRWaXnL31KJ9z7dEpMbS1ipTHHbWkBiD8q8hy92nsq"
      ) // select the relevant Space DID that is associated with your account


      console.log("🟡 Setting up Web3.Storage client...");

      try {
        // ✅ Step 1: Load the private key (KEY) for authentication
        const principal = Signer.parse(process.env.NEXT_PUBLIC_PRIVATEKEY);
        const store = new StoreMemory();
        const w3Client = await Client.create({ principal, store });

        console.log("✅ Web3.Storage client initialized.");
        
        if (!process.env.NEXT_PUBLIC_PROOF) {
          throw new Error("❌ UCAN Proof is missing in environment variables.");
        }
        
        // ✅ Step 2: Load the UCAN proof (PROOF) to gain access
        const proof = await Proof.parse(Buffer.from(process.env.NEXT_PUBLIC_PROOF).toString('base64'));
        const space = await w3Client.addSpace(proof);
        await w3Client.setCurrentSpace(space.did());

        console.log("✅ Web3.Storage space set:", space.did().toString());

        // ✅ Store the initialized client
        setClient(w3Client);
      } catch (err) {
        console.error("❌ Error initializing Web3.Storage:", err);
      }
    };

    setupClient();
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
        uploadToIPFS,
        currentAccount,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
