// import React, { useState, useEffect, useContext } from "react";
// import RequireAdmin from "../protectingRoutes/RequireAdmin";
// import { AuthContext } from "../context/AuthContext";
// import AdminSidebar from "@/components/NavBar/AdminNavBar";

// const ResultsPage = () => {
//   const { logout } = useContext(AuthContext);
//   const [results, setResults] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:5000/api/votes/results")
//       .then((res) => res.json())
//       .then((data) => setResults(data))
//       .catch((err) => console.error("Failed to fetch results:", err));
//   }, []);

//   return (
//     <RequireAdmin>
//       <div className="results-page">
//         <AdminSidebar />
//         <div className="results-content">
//           <h2>Voting Results</h2>
//           <ul>
//             {results.map(candidate => (
//               <li key={candidate.id}>
//                 {candidate.name}: {candidate.votes} votes ({candidate.percentage}%)
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </RequireAdmin>
//   );
// };

// export default ResultsPage;
