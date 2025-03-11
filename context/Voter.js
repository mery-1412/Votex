//api calls to pass the data how smart contract interacts 

import React , {useState,useEffect, Children} from 'react';
import  Web3Modal  from "web3modal";
import { ethers } from "ethers";
import {create as ipfsHttpClient} from "ipfs-http-client"
import axios from 'axios';
import { useRouter } from 'next/router';

//import interne from code 

import { VotingAddress,VotingAddressABI } from './constants';


///////ipfs and infura section 
//const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') can be used from tutorial 

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;

// Ensure variables exist
if (!projectId || !projectSecret) {
     throw new Error("Missing INFURA credentials! Check your .env.local file.");
 }
const auth = 'Basic ' + btoa(projectId + ":" + projectSecret);
//const auth = 'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64'); //in case it doesnt work 

const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth
  }
});


//interact with smart contract here :
const fetchContract = (signerOrProvider) =>
     new ethers.Contract(VotingAddress,VotingAddressABI ,signerOrProvider);

     //share voting data
    export const VotingContext = React.createContext();
    //share data to components 
    export const VotingProvider = ({children}) =>{

         const votingTitle= 'First Smart Conctract 3app';
         const router= useRouter();
         const[currentAccount,setCurrentAccount]=useState('');
         const[candidateLenght,setcandidateAccount]=useState('');
         const pushCandidate=[];
         const candidateIndex=[];
         const[candidateArray,setCandidateArray]=useState(pushCandidate);

///////////END OF CANDIDATE DATA 

          const[error,setError]=useState('');
          const highestVote=[];

///////////VOTER SECTION 

          const pushVoter=[];
          const[voterArray,setVoterArray]=useState(pushVoter);
          const[voterLength,setVoterLength]=useState('');
          const [voterAdress,setVoterAdress]=useState([]);

//////////Connection to metamask 

const checkIfWalletIsConnected= async() =>
 {
     if (!window.ethereum)return setError("Install MetaMask yal cavé")
     const account = await window.ethereum.request({method:"eth_accounts"});
     
     if (account.length){
          setCurrentAccount(account[0]);
     } else {
          setError("Install MetaMask and connect then reload...")
     }
};
////////CONNECT WALLET

const connectWallet=async()=>
{
     if (!window.ethereum)return setError("Install MetaMask to connect the wallet , yal cavé")
     const account = await window.ethereum.request({method:"eth_requestAccounts"});
     setCurrentAccount(account[0]);

}

//////UPLOAD to IPFS VOTER IMAGE (SIDE)

const uploadToIPFS = async(file)=>
{
try{
     const added = await client.add({content:file})
     const url =`https://ipfs.infura.io/ipfs/${added.path}`;
     return url;
}catch(error){
     setError("Error Uploading file to IPFS")
}
}
         return(
             <VotingContext.Provider value={{votingTitle,checkIfWalletIsConnected,connectWallet,uploadToIPFS}}>{children}</VotingContext.Provider>
          );
        
    };




