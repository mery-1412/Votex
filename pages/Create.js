import { useContext, useState } from "react";
import { VotingContext } from "../context/Voter";

export default function CreateCandidate() {
  const { createCandidate, uploadToPinata, currentAccount } = useContext(VotingContext);
  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [party, setParty] = useState("");
  const [ipfs, setIpfs] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert("❌ Select an image first!");
    setUploading(true);
    try {
      const ipfsHash = await uploadToPinata(image);
      setIpfs(ipfsHash);
      alert("✅ Image uploaded to IPFS: " + ipfsHash);
    } catch (error) {
      console.error("❌ Error uploading to IPFS:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ipfs) return alert("Upload image to IPFS first!");
    if (!currentAccount) return alert("Connect wallet first!");

    try {
      const success = await createCandidate(age, name, `https://gateway.pinata.cloud/ipfs/${ipfs}`, party, ipfs);

      if (success) {
        alert("✅ Candidate created successfully!");
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Candidate</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Age" 
          value={age} 
          onChange={(e) => setAge(e.target.value)} 
          required 
        /><br />
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        /><br />
        <input 
          type="file" 
          onChange={(e) => setImage(e.target.files[0])} 
          required 
        /><br />
        <button type="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Image to IPFS"}
        </button><br />
        {ipfs && <p>✅ Uploaded IPFS Hash: {ipfs}</p>}
        <input 
          type="text" 
          placeholder="Party" 
          value={party} 
          onChange={(e) => setParty(e.target.value)} 
          required 
        /><br />
        <button type="submit" disabled={!ipfs}>Create Candidate</button>
      </form>
    </div>
  );
}
