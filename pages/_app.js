import "@/styles/global.css";
import { VotingProvider } from "../context/Voter";
const MyApp = ({ Component, pageProps }) => (
  <VotingProvider>
  <div>

   <div>
      <title>VoteX</title>
      <meta name="description" content="A modern blockchain based voting application" />
      <Component {...pageProps} />
   </div>
 </div>
  </VotingProvider>
 );

export default MyApp;