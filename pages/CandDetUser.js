import React, { useState } from "react";
import UserNavBar from "../components/NavBar/UserNavBar"
import { useScroll } from "framer-motion";

const CandDetUder = () => { 

  const [cand, setCand] = useState({
    id: 1,
    name: "Nichole Smasher",
    desc: "Software Engineer",
    imageAdd: "",
  })

  return (
    <div className="flex items-center justify-center min-h-screen relative">
    <UserNavBar/>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative w-[90%] max-w-6xl p-12 bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-30 text-white mt-10">
        <h1 className="text-4xl font-semibold mb-12 ">{cand.name}</h1>

        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-10 m-8">
          <div className="w-full lg:w-1/3">
            <img
              src="/assets/cand.png"
              alt="Candidate"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="w-full lg:w-3/5 flex flex-col justify-center m-4">
            <h2 className="text-3xl font-semibold mb-4 text-center lg:text-left">Description</h2>
            <p className="text-gray-200 text-lg text-center lg:text-left">
              {cand.desc}
            </p>

            <div className="mt-6">
              <h2 className="text-3xl font-semibold mb-3 text-center lg:text-left">Certificates</h2>
              <ul className="list-disc list-inside text-lg text-gray-200 text-center lg:text-left">
                <li>bbbbbbbbbb</li>
                <li>bbbbbbbbbb</li>
                <li>wwwwwwwwwwwwww</li>
              </ul>
            </div>

            <div className="mt-8 flex justify-center lg:justify-end">
              <button className="gradient-border-button">
                VOTE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandDetUder;
