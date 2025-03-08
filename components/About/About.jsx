import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLink, FaVoteYea, FaChevronDown, FaChevronUp } from "react-icons/fa"; // Icons for blockchain, e-voting, and expand/collapse

// Component to animate text letter by letter
const AnimatedText = ({ text, className, delay = 0 }) => {
  const letters = Array.from(text); // Split text into letters

  return (
    <motion.span className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }} // Disappear when scrolling up
          transition={{ duration: 0.5, delay: delay + index * 0.02 }} // Smoother and faster staggered animation
          viewport={{ once: false, amount: 0.2 }}
          className="inline-block" // Ensure letters are treated as inline-block for spacing
        >
          {letter === " " ? "\u00A0" : letter} {/* Preserve spaces */}
        </motion.span>
      ))}
    </motion.span>
  );
};

const About = () => {
  // Track scroll progress for the entire page
  const { scrollYProgress } = useScroll();

  // State to manage expanded/collapsed sections
  const [isBlockchainExpanded, setIsBlockchainExpanded] = useState(false);
  const [isEVotingExpanded, setIsEVotingExpanded] = useState(false);

  // Transform scroll progress into opacity, y-position, and scale values
  const opacityBlockchain = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const yBlockchain = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const scaleBlockchain = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  const opacityEVoting = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);
  const yEVoting = useTransform(scrollYProgress, [0.3, 0.8], [100, 0]);
  const scaleEVoting = useTransform(scrollYProgress, [0.3, 0.8], [0.8, 1]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-20 p-10 text-white overflow-hidden" id="about">
      {/* Blockchain Section */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl relative mx-0 md:mx-10" // Added mx-0 md:mx-10
        style={{ opacity: opacityBlockchain, y: yBlockchain, scale: scaleBlockchain }}
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }} // Disappear when scrolling up
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Holographic Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-30 -z-10"
          initial={{ scale: 0.8, rotate: -45 }}
          whileInView={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.8, rotate: -45 }} // Disappear when scrolling up
          transition={{ duration: 2, ease: "easeOut" }} // Slower transition
        />

        {/* Particle Animation */}
        <motion.div
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }} // Disappear when scrolling up
          transition={{ duration: 1.5, delay: 0.5 }} // Slower transition
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-10 left-20 animate-float" />
          <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-20 right-10 animate-float" />
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute bottom-10 left-40 animate-float" />
        </motion.div>

        {/* Icon */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 180 }} // Disappear when scrolling up
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} // Slower transition
        >
          <FaLink className="w-32 h-32 md:w-48 md:h-48 text-blue-500 hover:text-purple-500 transition-colors duration-500 neon-glow" /> {/* Larger icon */}
        </motion.div>

        {/* Text */}
        <div className="max-w-lg text-center md:text-left mt-8 md:mt-0">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 neon-text tracking-tight">
            <AnimatedText text="What is Blockchain?" delay={0} /> {/* Animated heading */}
          </h2>
          <div className="text-lg md:text-xl tracking-tight mb-4"> {/* Reduced font size */}
            <AnimatedText text="Blockchain is a decentralized and distributed ledger system that securely records transactions across many computers." delay={0.2} /> {/* Animated paragraph */}
          </div>
          {/* Read More Section */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isBlockchainExpanded ? 1 : 0, height: isBlockchainExpanded ? "auto" : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="text-md md:text-lg mb-4"> {/* Reduced font size */}
              Blockchain technology ensures transparency, security, and immutability of data. It is the backbone of cryptocurrencies like Bitcoin and Ethereum, but its applications extend far beyond digital currencies. Industries such as healthcare, supply chain, and finance are leveraging blockchain for secure and efficient data management.
            </div>
            <div className="text-md md:text-lg"> {/* Reduced font size */}
              By eliminating intermediaries, blockchain reduces costs and increases trust in transactions. Its decentralized nature makes it resistant to tampering and fraud, ensuring data integrity.
            </div>
          </motion.div>
          {/* Read More Button */}
          <button
            onClick={() => setIsBlockchainExpanded(!isBlockchainExpanded)}
            className="flex items-center text-blue-500 hover:text-purple-500 transition-colors duration-300 mt-4"
          >
            {isBlockchainExpanded ? (
              <>
                Read Less <FaChevronUp className="ml-2" />
              </>
            ) : (
              <>
                Read More <FaChevronDown className="ml-2" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* E-Voting Section */}
      <motion.div
        className="flex flex-col md:flex-row-reverse items-center justify-between w-full max-w-5xl relative mx-0 md:mx-10" // Added mx-0 md:mx-10
        style={{ opacity: opacityEVoting, y: yEVoting, scale: scaleEVoting }}
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }} // Disappear when scrolling up
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Holographic Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-30 -z-10"
          initial={{ scale: 0.8, rotate: 45 }}
          whileInView={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.8, rotate: 45 }} // Disappear when scrolling up
          transition={{ duration: 2, ease: "easeOut" }} // Slower transition
        />

        {/* Particle Animation */}
        <motion.div
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }} // Disappear when scrolling up
          transition={{ duration: 1.5, delay: 0.5 }} // Slower transition
        >
          <div className="w-2 h-2 bg-purple-500 rounded-full absolute top-10 right-20 animate-float" />
          <div className="w-3 h-3 bg-pink-500 rounded-full absolute top-20 left-10 animate-float" />
          <div className="w-2 h-2 bg-purple-500 rounded-full absolute bottom-10 right-40 animate-float" />
        </motion.div>

        {/* Icon */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: -180 }} // Disappear when scrolling up
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} // Slower transition
        >
          <FaVoteYea className="w-32 h-32 md:w-48 md:h-48 text-purple-500 hover:text-pink-500 transition-colors duration-500 neon-glow" /> {/* Larger icon */}
        </motion.div>

        {/* Text */}
        <div className="max-w-lg text-left mt-8 md:mt-0"> {/* Changed text-center to text-left */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 neon-text tracking-tight">
            <AnimatedText text="Why E-Voting?" delay={0} /> {/* Animated heading */}
          </h2>
          <div className="text-lg md:text-xl tracking-tight mb-4"> {/* Reduced font size */}
            <AnimatedText text="E-Voting offers a secure, transparent, and efficient way to conduct elections using blockchain technology." delay={0.2} /> {/* Animated paragraph */}
          </div>
          {/* Read More Section */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isEVotingExpanded ? 1 : 0, height: isEVotingExpanded ? "auto" : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="text-md md:text-lg mb-4"> {/* Reduced font size */}
              E-Voting systems built on blockchain ensure that votes are tamper-proof and transparent. Each vote is recorded as a transaction on the blockchain, making it immutable and verifiable. This eliminates the risk of fraud and increases voter trust in the electoral process.
            </div>
            <div className="text-md md:text-lg"> {/* Reduced font size */}
              Additionally, e-voting reduces the cost and time associated with traditional voting methods. It enables remote voting, making it accessible to people who cannot physically attend polling stations. Blockchain-based e-voting is the future of democratic processes.
            </div>
          </motion.div>
          {/* Read More Button */}
          <button
            onClick={() => setIsEVotingExpanded(!isEVotingExpanded)}
            className="flex items-center text-purple-500 hover:text-pink-500 transition-colors duration-300 mt-4"
          >
            {isEVotingExpanded ? (
              <>
                Read Less <FaChevronUp className="ml-2" />
              </>
            ) : (
              <>
                Read More <FaChevronDown className="ml-2" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default About;