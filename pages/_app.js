
import "@/styles/global.css";
import { VotingProvider } from "../context/Voter";
const MyApp = ({ Component, pageProps }) => (
  <VotingProvider>
  <div>
  
   <div>
      <Component {...pageProps} />;
   </div>
 </div>
  </VotingProvider>
 );

export default MyApp;