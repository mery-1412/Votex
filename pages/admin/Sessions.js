import React, { useState, useEffect, useContext } from "react";
import RequireAdmin from "../protectingRoutes/RequireAdmin";
import AdminSidebar from "@/components/NavBar/AdminNavBar";
import Countdown from "@/components/Card/Countdown";
import { VotingContext } from "@/context/Voter";
import { AuthContext } from "../context/AuthContext";

const Sessions = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState("");
  const { currentAccount } = useContext(VotingContext);
  const { user, verifyWallet } = useContext(AuthContext);

  // Add verification check for admin wallet
  const checkWalletVerification = async () => {
    if (!currentAccount || !user?.role === 'admin') {
      setError("Please connect your admin wallet first");
      return false;
    }

    const isVerified = await verifyWallet(currentAccount);
    if (!isVerified) {
      setError("Please verify your admin wallet in dashboard");
      return false;
    }

    return true;
  };

  return (
    <RequireAdmin>
      <div className="sessions-page flex h-screen">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="w-full">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}
          <Countdown checkWalletVerification={checkWalletVerification} />
        </div>
      </div>
    </RequireAdmin>
  );
};

export default Sessions;
