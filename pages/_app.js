import "@/styles/global.css";
import { VotingProvider } from "../context/Voter";
import { AuthContextProvider } from "./context/AuthContext";

const MyApp = ({ Component, pageProps }) => (
  <AuthContextProvider>
  <VotingProvider>
  <div>

   <div>
      <title>VoteX</title>
      <meta name="description" content="A modern blockchain based voting application" />
      <Component {...pageProps} />
   </div>
 </div>
  </VotingProvider>
  </AuthContextProvider>
 );

export default MyApp;