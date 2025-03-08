import React,{useState,useEffect,useContext} from "react";
import Image from 'next/image';
import Countdown from 'react-countdown'

import { VotingContext } from "../context/Voter";

import image from "../assets/candidate-1.png"


const index = ()=>{

  const {votingTitle}  = useContext(VotingContext)
  return <div>{votingTitle}</div>;
  
};

export default index;