import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";


const ChangePassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()
  const { id, token } = router.query; 


  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    axios
      .post(`http://localhost:5000/api/auth/reset-password/${id}/${token}`, {
        password
      },
      {headers: {
        "Content-Type": "application/json", 
      },}
    )
      .then((res) => {
        console.log("res",res)
        if (res.status === 200) {
          router.push("/change-success")
        }
      })
      .catch(err =>{
        if (err.response && err.response.data && err.response.data.message) {
                   setError(err.response.data.message);
                } else {
                 setError('An error occurred. Please try again later.');
                }
      });
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative"   >
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
      <h2 className="text-xl mb-8">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 ">
              <input
                type="password"
                name="password"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                placeholder="New password"
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>
          <div className="flex flex-col space-y-2 ">
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
          </div>
        {error && <p className="text-red-300 text-sm">{error}</p>} 
        <button type="submit" className="gradient-border-button">
          Confirm
        </button>
      </form>
        </div>
  </div>
  );
};

export default ChangePassword;
