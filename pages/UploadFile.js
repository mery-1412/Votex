import { useContext, useState } from "react";
import { VotingContext } from "@/context/Voter"; 

const UploadFile = () => {
  const { uploadToPinata } = useContext(VotingContext);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const cid = await uploadToPinata(selectedFile);
    if (cid) {
      alert(`File uploaded! IPFS CID: ${cid}`);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload to Pinata</button>
    </div>
  );
};

export default UploadFile;
