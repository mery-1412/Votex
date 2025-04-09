import { useState, useContext} from "react";
import { useRouter } from "next/router";
import OnlyPublic from "../protectingRoutes/OnlyPublic";

import { AuthContext } from "../context/AuthContext"; // Import AuthContext


const LoginAdmin = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("")


  const router = useRouter();
  const { checkAuth } = useContext(AuthContext);



  const handleSubmit = async (e) =>{
    e.preventDefault();
    setIsLoading(true)
    const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password }),
    credentials: "include",
  })
  
  const json = await response.json()

  if(!response.ok){
    setError(json.error)
  } else {
    await checkAuth();
    router.push('/admin/Dashboard')

   
  }
  setIsLoading(false)


}

  return (
    <OnlyPublic>
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative"   >
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
      <h2 className="text-2xl mb-4">Admin Log In</h2>
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
                type="password"
                name="password"
                required
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
              />
          </div>

        {error && <p className="text-red-300 text-sm">{error}</p>} 

        <button type="submit" className="gradient-border-button">
          Log In
        </button>
      </form>
    </div>
  </div>
  </OnlyPublic>
  );
};

export default LoginAdmin;
