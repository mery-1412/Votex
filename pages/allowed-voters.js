//register new voters in here 

import React ,{useState,useEffect,useCallback,useContext} from "react";
import { useRouter } from "next/router";
import  {useDropzone} from "react-dropzone";
import Image from "next/image";
import { VotingContext } from "../context/Voter";
import Style from "../styles/allowedVoter.module.css"
import image from '../assets'
import Button from "../components/Button/Button";
import Input from '../components/Input';

const allowedVoters = () => {
  const [fileUrl,setFileUrl]=useState(null);
  const [formInput,setFormInput]=useState({
    name:"",
    address:"",
    position:"",
  });

  const router = useRouter();
  const {uploadToIPFS}=useContext(VotingContext);

/////////VOTERS IMAGE DROP 
  
  return <div></div>
};


export default allowedVoters