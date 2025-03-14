import { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";

export default function Heroo() {
  const [float, setFloat] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloat((prev) => !prev);
    }, 2000); // Animation every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 text-white min-h-screen">
      {/* Left Side */}
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-6xl font-bold">
          Secure & Decentralized Future
        </h1>
        <p className="text-lg text-gray-400 mt-4">
          Explore the power of Ethereum and blockchain technology for a
          decentralized world.
        </p>
      </div>

      {/* Right Side (Ethereum Icon) */}
      <div className="relative mt-10 md:mt-0">
        <div
          className={`transition-transform duration-1000 ${
            float ? "translate-y-4" : "-translate-y-4"
          }`}
        >
          <svg width="0" height="0">
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c03bfa" />
                <stop offset="50%" stopColor="#8a2be2" />
                <stop offset="100%" stopColor="#4293ea" />
              </linearGradient>
              {/* Neon Glow Filter */}
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                <feMerge>
                  <feMergeNode in="offsetBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
                <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#c03bfa" floodOpacity="0.8" />
                <feDropShadow dx="0" dy="0" stdDeviation="25" floodColor="#4293ea" floodOpacity="0.6" />
              </filter>
              {/* Moving Bottom Shadow */}
              <filter id="movingShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy={float ? "20" : "10"} // Adjust shadow position based on float state
                  stdDeviation="15"
                  floodColor="rgba(0, 0, 0, 0.7)"
                />
              </filter>
            </defs>
          </svg>
          <FaEthereum
            style={{
              fill: "url(#grad1)", // Gradient color
              filter: "url(#neonGlow) url(#movingShadow)", // Apply neon glow and moving shadow
              width: "300px", // Bigger size
              height: "300px",
            }}
          />
        </div>
      </div>
    </section>
  );
}