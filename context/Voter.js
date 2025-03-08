//api calls to pass the data how smart contract interacts 

import React , {useState,useEffect, Children} from 'react';
import  Web3Modal  from "web3modal";
import { ethers } from "ethers";
import {create as ipfsHttpClient} from "ipfs-http-client"
import axios from 'axios';
import { useRouter } from 'next/router';

//import interne from code 

import { VotingAddress,VotingAddressABI } from './constants';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const fetchContract = (signerOrProvider) =>
     new ethers.Contract(VotingAddress,VotingAddressABI ,signerOrProvider);


    export const VotingContext = React.createContext();

    export const VotingProvider = ({children}) =>{

         const votingTitle= ''
        return  <VotingContext.Provider value={{votingTitle}}>{children}</VotingContext.Provider>
        
    };




