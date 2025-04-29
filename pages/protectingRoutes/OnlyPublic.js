import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";
import { Loading } from "@/components/Loading";

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
    return <Loading />;
  }

  return user ? null : children;
};

export default OnlyPublic;
