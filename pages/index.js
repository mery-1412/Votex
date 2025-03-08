import React,{useState,useEffect,useContext} from "react";
import Countdown from 'react-countdown'

import { VotingContext } from "../context/Voter";
import Card from '../components/card/card';



const index = ()=>{

  const {votingTitle}  = useContext(VotingContext)
  return <div>{votingTitle}</div>;
  
};

export default index;