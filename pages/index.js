import React, { useContext } from "react";
import { VotingContext } from "../context/Voter";
import NavBar from '@/components/NavBar/NavBar';
import Heroo from "@/components/HeroSection/Heroo";
import About from '@/components/About/About';
import Contact from '@/components/Contact/Contact';
import Footer from '@/components/Footer/Footer';
import OnlyPublic from "./protectingRoutes/OnlyPublic";
const Index = () => {
  const { votingTitle } = useContext(VotingContext);

  return (
    <OnlyPublic>
    <div>
      {/* Display the voting title from context */}
      {votingTitle}

      {/* Render components */}
      <NavBar />
      <Heroo />
      <About />
      <Contact />
      <Footer />
    </div>
    </OnlyPublic>
  );
};

export default Index;