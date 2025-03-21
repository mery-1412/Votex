import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import OnlyPublic from "../protectingRoutes/OnlyPublic";



const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idNumber, setidNumber] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login')
}

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setIsLoading(true);
        
    axios.post("http://localhost:5000/api/auth/register",{email,password,idNumber})
    .then(res=>{
      setIsLoading(false);
      router.push("/auth/Login")       
    }).catch(err => {
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        console.log('An error occurred. Please try again later.');
      }

    })

    setIsLoading(false);
  };

  return (
    <OnlyPublic>
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" >
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>

    <div className="absolute top-5 left-5 cursor-pointer" onClick={() => router.push("/")}>
              <img src="assets/logo.png" alt="Logo" className="w-16 h-16 z-100" />
            </div>
    <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
              <input
                type="email"
                name="email"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email "

              />
          </div>
          <div className="flex flex-col space-y-2">
              <input
                type="cardId"
                name="cardId"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                onChange={(e) => setidNumber(e.target.value)}
                placeholder="Enter Card Id"
              />
          </div>
          <div className="flex flex-col space-y-2">
              <input
                type="password"
                name="password"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
              />
          </div>
          <div className="flex flex-col space-y-2">
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
              />
          </div>
          {error && <p className="text-red-300 text-sm">{error}</p>} 

          <button type="submit" className="gradient-border-button">
            Sign Up
          </button>
        
      </form>
      <p className="mt-4 ">Already have an account? <a className="hover:underline" onClick={handleLoginRedirect}>Log In</a></p>
    </div>
  </div>
  </OnlyPublic>
  );
};

export default Signup;
