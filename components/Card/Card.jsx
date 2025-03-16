
import React from "react";
 
import {Ethereum} from 'lucide-react'
const Card = () => {
  return (
      <section className="flex flex-col md:flex-row justify-between items-center min-h-screen px-8">
      {/* Left Side: Title & Paragraph */}
      <div className="text-white max-w-xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          E-Voting System For Better Future
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Secure, Decentralized, and Built for Everyone.
        </p>
      </div>
  
      {/* Right Side: Ethereum Icon */}
      <div className="relative flex items-center justify-center mt-10 md:mt-0">
        <Ethereum
          className="animate-float transition-all duration-1000 ease-in-out"
          size={150} // Icon size
          style={{
            fill: "url(#grad1)", // Apply gradient
            filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))", // Shadow effect
          }}
        />
  
        {/* Gradient Definition */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgb(192,59,250)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgb(66,147,234)", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}

export default Card

