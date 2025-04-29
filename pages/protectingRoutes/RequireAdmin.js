import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";
import { Loading } from "@/components/Loading";

const RequireAdmin = ({ children }) => {
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
          router.replace("/admin-login");
          return;
        }

        if (user.role !== "admin") {
          if (user.role === "voter") {
            router.replace("/home-user");
          } else {
            router.replace("/admin-login");
          }
        }
      }
    };

    checkUser();
  }, [user, isAuthLoading, router]);

  if (isChecking) {
    return <Loading />;
  }

  return user && user.role === "admin" ? children : null;
};

export default RequireAdmin;
