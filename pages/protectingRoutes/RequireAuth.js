import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";
import { Loading } from "@/components/Loading";

const RequireAuth = ({ children }) => {
  const { user, isAuthLoading } = useContext(AuthContext);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (isAuthLoading) {
        setIsChecking(true);
      } else {
        setIsChecking(false);

        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.role !== "voter") {
          if (user.role === "admin") {
            router.replace("/dashboard");
          } else {
            router.replace("/login");
          }
        }
      }
    };

    checkUser();
  }, [user, isAuthLoading, router]);

  if (isChecking) {
    return <Loading />; 
  }

  return user && user.role === "voter" ? children : null;
};

export default RequireAuth;
