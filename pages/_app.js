import { Loading } from "../components/Loading"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { VotingProvider } from "../context/Voter";
import { AuthContextProvider } from "./context/AuthContext";
import "@/styles/global.css";

const MyApp = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true); 
    const handleComplete = () => setLoading(false); 

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete); 

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.events]);

  return (
    <AuthContextProvider>
      <VotingProvider>
        <div>
          {loading && <Loading />} 
          <div>
            <title>VoteX</title>
            <meta name="description" content="A modern blockchain based voting application" />
            <Component {...pageProps} />
          </div>
        </div>
      </VotingProvider>
    </AuthContextProvider>
  );
};

export default MyApp;
