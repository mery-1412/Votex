import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); 

  const router = useRouter();
  const checkAuth = async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/test-users/getUser", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        console.log("✅ User authenticated:", data);
      } else {
        setUser(false); 
      }
    } catch (error) {
      console.error("❌ Authentication check failed", error);
      setUser(false);
    }
    setIsAuthLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);


  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null); 
      router.push("/login"); 
    } catch (error) {
      console.error("❌ Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
