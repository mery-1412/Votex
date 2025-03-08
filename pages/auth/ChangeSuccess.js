import { useState } from "react";
import { useRouter } from "next/router";

const ChangeSuccess = () => {
    const router = useRouter();
    
    const handleGoHome = () => {
        router.push("/auth/Login");
      };


  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative"   >
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="relative w-96 p-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white text-center">
      <h1 className="text-2xl mb-8">Your Password Has Been Reset Successfully</h1>
      <img src='/assets/check.png' alt="Mail Success" className="w-48 h-36 mx-auto mb-4 object-contain" />

      <button
        onClick={handleGoHome}
        className="gradient-border-button"
        >
        Go Back to Login
    </button>
    </div>
  </div>
  );
};

export default ChangeSuccess;
