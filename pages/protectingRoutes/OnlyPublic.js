import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";

const OnlyPublic = ({ children }) => {
  const { user, isAuthLoading } = useContext(AuthContext);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (isAuthLoading) {
        setIsChecking(true);
      } else {
        setIsChecking(false);

        // ✅ Fix: Ensure user exists before checking role
        if (user) {
          if (user.role === "voter") {
            await router.replace("/home-user");
          } else if (user.role === "admin") {
            await router.replace("/dashboard");
          }
        }
      }
    };

    checkUser();
  }, [user, isAuthLoading, router]);

  if (isChecking) {
    return <p>Loading...</p>;
  }

  return user ? null : children;
};

export default OnlyPublic;
