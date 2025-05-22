import { Modal, Label } from "flowbite-react";
import { useState, useContext, useEffect } from "react";
import { VotingContext } from "../context/Voter"; 
import { AuthContext } from "../pages/context/AuthContext";
import { Popup } from "./Popup";
 
export function AddProductDialog() {
  const [openModal, setOpenModal] = useState(false);
  const { createCandidate, uploadToPinata, currentAccount, message, errMessage, setMessage, setErrMessage } = useContext(VotingContext);
  const { user, verifyWallet } = useContext(AuthContext);
  
  const [age, setAge] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [party, setParty] = useState("");
  const [ipfs, setIpfs] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isWalletVerified, setIsWalletVerified] = useState(false);

  // Check if user can add a candidate
  const checkWalletVerification = async () => {
    if (user?.role === 'admin' && currentAccount) {
      // Check wallet verification with the improved verification function
      const isVerified = await verifyWallet(currentAccount);
      setIsWalletVerified(isVerified);
      
      if (!isVerified) {
        setMsg("Please connect and verify your admin wallet in the dashboard first");
      } else {
        setMsg("");
      }
      
      return isVerified;
    }
    return false;
  };

  useEffect(() => {
    if (openModal) {
      checkWalletVerification();
    }
  }, [openModal, currentAccount, user]);
  
  const handleUpload = async () => {
    const verified = await checkWalletVerification();
    if (!verified) {
      setMsg("Please connect and verify your admin wallet in the dashboard first");
      return;
    }
    
    if (!image) {
      setMsg("Upload an image first");
      return;
    }
    
    setUploading(true);
    setMsg("");
    setErrMessage("");
    
    try {
      const ipfsHash = await uploadToPinata(image);
      setIpfs(ipfsHash);
      setMsg("Image uploaded successfully to IPFS");
    } catch (error) {
      setMsg("Error uploading to IPFS");
      console.error("❌ Error uploading to IPFS:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verified = await checkWalletVerification();
    if (!verified) {
      setMsg("Please connect and verify your admin wallet in the dashboard first");
      return;
    }

    if (!ipfs) {
      setMsg("Upload image to IPFS first!");
      return;
    }

    try {
      setLoading(true);
      const success = await createCandidate(age, name, `https://gateway.pinata.cloud/ipfs/${ipfs}`, party, ipfs);
      if (success) {
        setSuccess(true);
        setMsg("Candidate added successfully");
        setOpenModal(false);
        setIpfs("");
        setAge("");
        setName("");
        setImage(null);
        setParty("");
      }
    } catch (error) {
      setSuccess(false);
      setMsg("Error adding candidate");
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <button 
        className="gradient-border-button-black" 
        onClick={() => setOpenModal(true)}
      >
        Add Candidate
      </button>

      <Modal show={openModal} onClose={() => {
        setOpenModal(false);
        setIpfs(false);
        setMessage("");
        setMsg("");
        setErrMessage("");
      }} size="xl">
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-lg z-50">
          <div className="bg-[#3A2663] backdrop-blur-2xl p-8 rounded-lg shadow-2xl border border-black/20 w-full max-w-lg">
            <Modal.Header>
              <h2 className="text-2xl font-semibold text-white text-center mb-2">Add a New Candidate</h2>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-6 p-4 bg-black/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${isWalletVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className={`${isWalletVerified ? 'text-green-300' : 'text-amber-300'}`}>
                    {isWalletVerified ? 'Admin wallet verified' : 'Please connect and verify your admin wallet in the dashboard'}
                  </p>
                </div>
                {currentAccount && (
                  <p className="text-gray-300 text-sm break-all">
                    {currentAccount}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col">
                  <Label htmlFor="candidateName" value="Candidate Name" className="text-white text-sm font-medium mb-1" />
                  <input id="candidateName" placeholder="Enter Candidate name" required value={name} onChange={(e) => setName(e.target.value)} 
                  className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"/>
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="age" value="Age" className="text-white text-sm font-medium mb-1" />
                  <input id="age" placeholder="Enter Age" required value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"
                   />
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="party" value="Party" className="text-white text-sm font-medium mb-1" />
                  <input id="party" placeholder="Enter Party Name" required value={party} onChange={(e) => setParty(e.target.value)}
                    className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50"
                  />
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="fileUpload" value="Upload Image" className="text-white text-sm font-medium mb-1" />
                  <input 
                    id="fileUpload" 
                    type="file" 
                    onChange={(e) => setImage(e.target.files[0])} 
                    required 
                    className="w-full p-2 border border-black/30 rounded-md bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-black file:bg-white/30 file:border-0 file:p-2 file:rounded-md file:text-white hover:file:bg-white/50" 
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={handleUpload} 
                  disabled={uploading || !currentAccount || !image || !isWalletVerified} 
                  className={`gradient-border-button ${(!currentAccount || !image || !isWalletVerified) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? "Uploading..." : "Upload Image to IPFS"}
                </button>
                
                {ipfs && <p className="text-green-400">Uploaded to IPFS</p>}
                
                {msg && (
                  <p className="text-red-500 text-sm mt-2">{msg}</p>
                )}  
                
                {errMessage && (
                  <p className="text-red-500 text-sm mt-2">{errMessage}</p>
                )}  
                
                {loading && (
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full border-t-4 border-b-4 border-purple-500 h-12 w-12"></div>
                    <p className="ml-2 mt-4 text-white">Processing, wait a moment please...</p>
                  </div>
                )}
                
                <Modal.Footer className="flex justify-end space-x-3">
                  <button 
                    type="submit" 
                    disabled={!ipfs || !isWalletVerified || loading} 
                    className={`gradient-border-button ${(!ipfs || !isWalletVerified || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Create Candidate
                  </button>
                  <button 
                    onClick={() => {
                      setOpenModal(false);
                      setMessage("");
                      setMsg("");
                      setErrMessage("");
                    }} 
                    className="gradient-border-button"
                  >
                    Cancel
                  </button>
                </Modal.Footer>
              </form>
            </Modal.Body>
          </div>
        </div>
      </Modal>
    </>
  );
}