import React, { useState, useCallback, useContext } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { VotingContext } from "../context/Voter";
import Style from "../styles/allowedVoter.module.css";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";

const allowedVoters = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    age: "",
    parti: "",
    address: "",
  });

  const router = useRouter();
  const { uploadToIPFS } = useContext(VotingContext);

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles) => {
    const url = await uploadToIPFS(acceptedFiles[0]);
    setFileUrl(url);
  }, [uploadToIPFS]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 50000000,
  });

  return (
    <div className={Style.voter}>
      {fileUrl ? (
        <div className={Style.voterInfo}>
          <Image src={fileUrl} width={200} height={200} alt="Voter Image" />
          <div className={Style.voterInfo_paragraph}>
            <p>Name: <span>{formInput.name}</span></p>
            <p>Age: <span>{formInput.age}</span></p>
            <p>Parti: <span>{formInput.parti}</span></p>
          </div>
        </div>
      ) : (
        <div className={Style.sideInfo}>
          <div className={Style.sideInfo_box}>
            <h4>Create Candidate For Voting</h4>
            <p>Blockchain voting organization, provide Ethereum</p>
          </div>
        </div>
      )}

      <div className={Style.voter_container}>
        <h1>Create New candidate</h1>

        <div className={Style.voter_container_box}>
          <div className={Style.voter_container_box_div}>
            <div {...getRootProps()} className={Style.voter_container_box_div_upload}>
              <input {...getInputProps()} />
              <div className={Style.voter_container_box_div_info}>
                <p>Upload File: JPG, PNG, GIF, WEBM Max 0MB</p>
                <div className={Style.voter_container_box_div_image}>
                  <Image
                     // Ensure this path is correct
                    width={150}
                    height={150}
                    objectFit="contain"
                    alt="File upload"
                  />
                </div>
                <p>Drop image here</p>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.input_container}>
          <Input
            inputType="text"
            title="Name"
            placeholder="candidate Name"
            handleClick={(e) =>
              setFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Age"
            placeholder="candidate Age"
            handleClick={(e) =>
              setFormInput({ ...formInput, age: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Parti"
            placeholder="candidate Party"
            handleClick={(e) =>
              setFormInput({ ...formInput, parti: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Voter Address"
            handleClick={(e) =>
              setFormInput({ ...formInput, address: e.target.value })
            }
          />
        </div>

        <Button
          btnName="Register Voter"
          handleClick={() => console.log("Voter Registered:", formInput)}
        />
      </div>
    </div>
  );
};

export default allowedVoters;
