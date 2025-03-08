import { useState } from "react";
import { useRouter } from "next/router";


const FrogotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(true)

  const router = useRouter()

  const handleSubmit = (e) =>{
    e.preventDefault();
    axios.post('', {email})
    .then(res=>{
      setIsValid(true)
      router.push("/auth/EmailSent")
    }
    ).catch(err => {
      if (err.response && err.response.data && err.response.data.message) {
                   setError(err.response.data.message);
                   } else {
                   setError('An error occurred. Please try again later.');
                 }
      console.log(err)})
  
   }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative"   >
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
      <h2 className="text-xl mb-8">Enter your existing Email</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 mb-4">
              <input
                type="email"
                name="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-300 outline-none text-white p-2"
                placeholder="Email"
              />
          </div>
        {error && <p className="text-red-300 text-sm">{error}</p>} 
        <button type="submit" className="gradient-border-button">
          Search
        </button>
      </form>
        </div>
  </div>
  );
};

export default FrogotPassword;
