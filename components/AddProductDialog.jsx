"use client";

import { Button, Modal, Label } from "flowbite-react";
import { useState, useContext } from "react";
import { VotingContext } from "../context/Voter"; 

export function AddProductDialog() {
  const [openModal, setOpenModal] = useState(false);
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
        setOpenModal(false);

        setIpfs(false);
        setAge("");
        setName("");
        setImage(null);
        setParty("");
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <>
      <button className="gradient-border-button-black" onClick={() => setOpenModal(true)}>Add Candidate</button>

      {/* Modal with Glassmorphism Effect */}
      <Modal show={openModal} onClose={() => {setOpenModal(false);  setIpfs(false); }} size="xl">
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg">
          {/* Modal Content */}
          <div className="bg-[#3A2663] backdrop-blur-2xl p-8 rounded-lg shadow-2xl border border-black/20 w-full max-w-lg">
            <Modal.Header>
              <h2 className="text-2xl font-semibold text-white text-center mb-2">Add a New Candidate</h2>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Candidate Name */}
                <div className="flex flex-col">
                  <Label htmlFor="candidateName" value="Candidate Name" className="text-white text-sm font-medium mb-1" />
                  <input id="candidateName" placeholder="Enter Candidate name" required value={name} onChange={(e) => setName(e.target.value)} 
                  className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"/>
                </div>

                {/* Age */}
                <div className="flex flex-col">
                  <Label htmlFor="age" value="Age" className="text-white text-sm font-medium mb-1" />
                  <input id="age" placeholder="Enter Age" required value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"
                   />
                </div>

                {/* Party */}
                <div className="flex flex-col">
                  <Label htmlFor="party" value="Party" className="text-white text-sm font-medium mb-1" />
                  <input id="party" placeholder="Enter Party Name" required value={party} onChange={(e) => setParty(e.target.value)}
className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"                    />
                </div>

                {/* File Upload */}
                <div className="flex flex-col">
                  <Label htmlFor="fileUpload" value="Upload Image" className="text-white text-sm font-medium mb-1" />
                  <input id="fileUpload" type="file" onChange={(e) => setImage(e.target.files[0])} required className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50" />
                </div>
                <button type="button" onClick={handleUpload} disabled={uploading} className="gradient-border-button">
                  {uploading ? "Uploading..." : "Upload Image to IPFS"}
                </button>
                {ipfs && <p className="text-green-400">Uploaded to IPFS</p>}
              
                <Modal.Footer className="flex justify-end space-x-3">
                  <button type="submit" disabled={!ipfs} className="gradient-border-button">Create Candidate</button>
                  <button onClick={() => setOpenModal(false)} className="gradient-border-button">Cancel</button>
                </Modal.Footer>
              </form>
            </Modal.Body>
          </div>
        </div>
      </Modal>
    </>
  );
}

